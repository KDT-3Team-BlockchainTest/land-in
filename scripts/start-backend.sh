#!/bin/bash
# Land-in 백엔드 시작 스크립트
set -e

cd /home/ubuntu/Desktop/land-in/land-in/backend

export SPRING_PROFILES_ACTIVE=local
export JAVA_HOME=/home/ubuntu/.sdkman/candidates/java/current

exec /home/ubuntu/Desktop/land-in/land-in/backend/../gradlew bootRun
