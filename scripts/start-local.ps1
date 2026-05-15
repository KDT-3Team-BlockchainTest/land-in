param(
    [switch]$SkipInstall,
    [switch]$NoDockerMySql,
    [int]$BackendPort = 8080,
    [int]$FrontendPort = 5173,
    [int]$AdminPort = 5174,
    [int]$MysqlPort = 3306
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeDir = Join-Path $Root ".landin-runtime"
$LogDir = Join-Path $RuntimeDir "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Test-Command {
    param([string]$Name)
    $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-Port {
    param([int]$Port)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $connected = $iar.AsyncWaitHandle.WaitOne(250, $false)
        if ($connected) {
            $client.EndConnect($iar)
        }
        $client.Close()
        return $connected
    } catch {
        return $false
    }
}

function Wait-Http {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 90
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    return $false
}

function Start-LoggedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory
    )

    $stdout = Join-Path $LogDir "$Name.out.log"
    $stderr = Join-Path $LogDir "$Name.err.log"

    $resolvedPath = $FilePath
    if (-not [System.IO.Path]::IsPathRooted($FilePath)) {
        $candidate = Join-Path $WorkingDirectory $FilePath
        if (Test-Path $candidate) {
            $resolvedPath = (Resolve-Path $candidate).Path
        } else {
            $cmd = Get-Command $FilePath -ErrorAction SilentlyContinue
            if ($cmd) { $resolvedPath = $cmd.Source }
        }
    }

    $startParams = @{
        FilePath             = $resolvedPath
        ArgumentList         = $ArgumentList
        WorkingDirectory     = $WorkingDirectory
        RedirectStandardOutput = $stdout
        RedirectStandardError  = $stderr
        PassThru             = $true
    }
    if ($env:OS -eq "Windows_NT") { $startParams['WindowStyle'] = 'Hidden' }
    $process = Start-Process @startParams

    Set-Content -Path (Join-Path $RuntimeDir "$Name.pid") -Value $process.Id
    Write-Host "Started $Name (PID $($process.Id)); logs: $stdout"
}

function Ensure-Tool {
    param([string]$Name, [string]$InstallHint)
    if (-not (Test-Command $Name)) {
        throw "$Name is required. $InstallHint"
    }
}

function Ensure-JavaOnPath {
    if (Test-Command "java") { return }

    $candidates = @()
    if ($env:JAVA_HOME) { $candidates += $env:JAVA_HOME }
    $searchRoots = @(
        "C:\Program Files\Eclipse Adoptium",
        "C:\Program Files\Java",
        "C:\Program Files\Microsoft",
        "C:\Program Files\Zulu",
        "$env:LOCALAPPDATA\Programs\Eclipse Adoptium"
    )
    foreach ($root in $searchRoots) {
        if (Test-Path $root) {
            $candidates += Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -match "jdk-?2[1-9]" } |
                Sort-Object Name -Descending |
                ForEach-Object { $_.FullName }
        }
    }

    foreach ($javaHome in $candidates) {
        $javaBin = Join-Path $javaHome "bin"
        if (Test-Path (Join-Path $javaBin "java.exe")) {
            $env:JAVA_HOME = $javaHome
            $env:Path = "$javaBin;$env:Path"
            Write-Host "Using JAVA_HOME: $javaHome"
            return
        }
    }
}

Write-Host "Land-In local stack startup"
Write-Host "Workspace: $Root"

Ensure-JavaOnPath
Ensure-Tool "java" "Install Java 21 and make sure java is on PATH (or set JAVA_HOME)."
Ensure-Tool "node" "Install Node.js 20+ and make sure node is on PATH."
Ensure-Tool "npm" "Install Node.js 20+ and make sure npm is on PATH."

if (-not $SkipInstall) {
    Write-Host "Installing frontend dependencies..."
    Push-Location (Join-Path $Root "frontend")
    npm install
    Pop-Location

    Write-Host "Installing admin frontend dependencies..."
    Push-Location (Join-Path $Root "frontend-admin")
    npm install
    Pop-Location
}

if (-not $NoDockerMySql -and -not (Test-Port $MysqlPort) -and (Test-Command "docker")) {
    Write-Host "MySQL is not listening on port $MysqlPort. Starting Docker container land-in-mysql..."
    $existing = docker ps -a --filter "name=^/land-in-mysql$" --format "{{.Names}}"
    if ($existing -eq "land-in-mysql") {
        docker start land-in-mysql | Out-Null
    } else {
        docker run `
            --name land-in-mysql `
            -e MYSQL_ROOT_PASSWORD=1234 `
            -e MYSQL_DATABASE=landin_db `
            -p "${MysqlPort}:3306" `
            -d mysql:8.4 | Out-Null
    }

    Write-Host "Waiting for MySQL on port $MysqlPort..."
    $deadline = (Get-Date).AddSeconds(90)
    while (-not (Test-Port $MysqlPort) -and (Get-Date) -lt $deadline) {
        Start-Sleep -Seconds 2
    }
}

if (-not (Test-Port $MysqlPort)) {
    Write-Warning "MySQL is not reachable on localhost:$MysqlPort. Start MySQL manually or install Docker Desktop and rerun this script."
    Write-Warning "Default backend credentials are root / 1234 against database landin_db."
}

$env:SPRING_PROFILES_ACTIVE = if ($env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE } else { "local" }
$env:SPRING_DATASOURCE_URL = if ($env:SPRING_DATASOURCE_URL) { $env:SPRING_DATASOURCE_URL } else { "jdbc:mysql://localhost:${MysqlPort}/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8" }
$env:SPRING_DATASOURCE_USERNAME = if ($env:SPRING_DATASOURCE_USERNAME) { $env:SPRING_DATASOURCE_USERNAME } else { "root" }
$env:SPRING_DATASOURCE_PASSWORD = if ($env:SPRING_DATASOURCE_PASSWORD) { $env:SPRING_DATASOURCE_PASSWORD } else { "1234" }
$env:APP_PUBLIC_BASE_URL = if ($env:APP_PUBLIC_BASE_URL) { $env:APP_PUBLIC_BASE_URL } else { "http://localhost:$BackendPort" }
$env:PORT = "$BackendPort"

$runningOnWindows = ($env:OS -eq "Windows_NT")
$gradleFile = if ($runningOnWindows) { ".\gradlew.bat" } else { "./gradlew" }
$npmFile = if ($runningOnWindows) { "npm.cmd" } else { "npm" }

if (-not $runningOnWindows) {
    $gradlewPath = Join-Path $Root "backend/gradlew"
    if (Test-Path $gradlewPath) {
        & chmod +x $gradlewPath | Out-Null
    }
}

if (-not (Test-Port $BackendPort)) {
    Start-LoggedProcess `
        -Name "backend" `
        -FilePath $gradleFile `
        -ArgumentList @("bootRun") `
        -WorkingDirectory (Join-Path $Root "backend")
} else {
    Write-Host "Backend port $BackendPort is already in use; not starting another backend."
}

if (-not (Test-Port $FrontendPort)) {
    Start-LoggedProcess `
        -Name "frontend" `
        -FilePath $npmFile `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "$FrontendPort") `
        -WorkingDirectory (Join-Path $Root "frontend")
} else {
    Write-Host "Frontend port $FrontendPort is already in use; not starting another frontend."
}

if (-not (Test-Port $AdminPort)) {
    Start-LoggedProcess `
        -Name "frontend-admin" `
        -FilePath $npmFile `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "$AdminPort") `
        -WorkingDirectory (Join-Path $Root "frontend-admin")
} else {
    Write-Host "Admin frontend port $AdminPort is already in use; not starting another admin frontend."
}

Write-Host "Waiting for services..."
$backendReady = Wait-Http "http://127.0.0.1:$BackendPort/api/events" 120
$frontendReady = Wait-Http "http://127.0.0.1:$FrontendPort/" 60
$adminReady = Wait-Http "http://127.0.0.1:$AdminPort/" 60

Write-Host ""
Write-Host "Land-In local stack"
Write-Host "Backend API     : http://localhost:$BackendPort"
Write-Host "User frontend   : http://localhost:$FrontendPort"
Write-Host "Admin frontend  : http://localhost:$AdminPort"
Write-Host "Admin login     : admin@landin.local / admin1234!"
Write-Host "Logs            : $LogDir"
Write-Host ""
Write-Host "Ready flags     : backend=$backendReady frontend=$frontendReady admin=$adminReady"
Write-Host "Stop processes manually with the PID files in $RuntimeDir, or close them from Task Manager."

