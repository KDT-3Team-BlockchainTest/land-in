// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LandinBadgeNFT
/// @notice Minimal ERC-721 contract for Land-in NFC badge minting.
/// @dev The backend currently expects a mint function with this exact signature:
///      safeMint(address to, string tokenUri)
///      Minted tokens store a per-token metadata URI and emit the standard
///      ERC-721 Transfer event so the backend can extract tokenId from logs.
contract LandinBadgeNFT {
    error InvalidAddress();
    error TokenDoesNotExist();
    error TokenAlreadyMinted();
    error NotAuthorized();
    error UnsafeRecipient();

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MinterUpdated(address indexed account, bool allowed);

    string private _name;
    string private _symbol;
    address private _owner;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenUris;
    mapping(address => bool) private _minters;

    bytes4 private constant _ERC165_INTERFACE_ID = 0x01ffc9a7;
    bytes4 private constant _ERC721_INTERFACE_ID = 0x80ac58cd;
    bytes4 private constant _ERC721_METADATA_INTERFACE_ID = 0x5b5e139f;
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
    bytes4 private constant _ON_ERC721_RECEIVED_SELECTOR = 0x150b7a02;

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotAuthorized();
        }
        _;
    }

    modifier onlyMinter() {
        if (!_minters[msg.sender]) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        address initialMinter
    ) {
        if (initialOwner == address(0)) {
            revert InvalidAddress();
        }

        _name = name_;
        _symbol = symbol_;
        _owner = initialOwner;

        address effectiveMinter = initialMinter == address(0) ? initialOwner : initialMinter;
        _minters[effectiveMinter] = true;

        emit OwnershipTransferred(address(0), initialOwner);
        emit MinterUpdated(effectiveMinter, true);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == _ERC165_INTERFACE_ID ||
            interfaceId == _ERC721_INTERFACE_ID ||
            interfaceId == _ERC721_METADATA_INTERFACE_ID;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function isMinter(address account) external view returns (bool) {
        return _minters[account];
    }

    function balanceOf(address account) public view returns (uint256) {
        if (account == address(0)) {
            revert InvalidAddress();
        }
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) {
            revert TokenDoesNotExist();
        }
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        _requireMinted(tokenId);
        return _tokenUris[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert InvalidAddress();
        }

        address previousOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function setMinter(address account, bool allowed) external onlyOwner {
        if (account == address(0)) {
            revert InvalidAddress();
        }

        _minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    /// @notice Mint one NFT to `to` with a metadata URL.
    /// @dev This exact signature is used by the Spring backend.
    function safeMint(address to, string calldata tokenUri_) external onlyMinter returns (uint256 tokenId) {
        if (to == address(0)) {
            revert InvalidAddress();
        }

        tokenId = _nextTokenId;
        _nextTokenId += 1;

        _mint(to, tokenId);
        _tokenUris[tokenId] = tokenUri_;

        if (to.code.length > 0) {
            _checkOnERC721Received(address(0), to, tokenId, "");
        }
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        if (to == tokenOwner) {
            revert NotAuthorized();
        }
        if (msg.sender != tokenOwner && !_operatorApprovals[tokenOwner][msg.sender]) {
            revert NotAuthorized();
        }

        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        if (operator == msg.sender) {
            revert NotAuthorized();
        }

        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) {
            revert NotAuthorized();
        }
        if (ownerOf(tokenId) != from || to == address(0)) {
            revert NotAuthorized();
        }

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            _checkOnERC721Received(from, to, tokenId, data);
        }
    }

    function _mint(address to, uint256 tokenId) private {
        if (_owners[tokenId] != address(0)) {
            revert TokenAlreadyMinted();
        }

        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) private {
        delete _tokenApprovals[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) private view returns (bool) {
        address tokenOwner = ownerOf(tokenId);
        return (
            spender == tokenOwner ||
            _operatorApprovals[tokenOwner][spender] ||
            getApproved(tokenId) == spender
        );
    }

    function _requireMinted(uint256 tokenId) private view {
        if (_owners[tokenId] == address(0)) {
            revert TokenDoesNotExist();
        }
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private {
        (bool success, bytes memory returnData) = to.call(
            abi.encodeWithSelector(_ON_ERC721_RECEIVED_SELECTOR, msg.sender, from, tokenId, data)
        );

        if (!success || returnData.length < 32) {
            revert UnsafeRecipient();
        }

        bytes4 retval = abi.decode(returnData, (bytes4));
        if (retval != _ERC721_RECEIVED) {
            revert UnsafeRecipient();
        }
    }
}
