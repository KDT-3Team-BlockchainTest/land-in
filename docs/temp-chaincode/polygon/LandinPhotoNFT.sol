// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LandinPhotoNFT {
    error InvalidAddress();
    error NotAuthorized();
    error TokenDoesNotExist();

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MinterUpdated(address indexed account, bool allowed);

    struct VisitMintProof {
        bytes32 visitProofHash;
        string regionCode;
        string campaignId;
        string metadataCID;
        uint64 mintedAt;
    }

    string private _name;
    string private _symbol;
    address private _owner;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(uint256 => string) private _tokenUris;
    mapping(address => bool) private _minters;
    mapping(uint256 => VisitMintProof) private _visitMintProofs;

    modifier onlyOwner() {
        if (msg.sender != _owner) revert NotAuthorized();
        _;
    }

    modifier onlyMinter() {
        if (!_minters[msg.sender]) revert NotAuthorized();
        _;
    }

    constructor(string memory name_, string memory symbol_, address initialOwner, address initialMinter) {
        if (initialOwner == address(0)) revert InvalidAddress();

        _name = name_;
        _symbol = symbol_;
        _owner = initialOwner;
        _minters[initialMinter == address(0) ? initialOwner : initialMinter] = true;
    }

    function setMinter(address account, bool allowed) external onlyOwner {
        if (account == address(0)) revert InvalidAddress();
        _minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    function safeMint(address to, string calldata tokenUri_) external onlyMinter returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidAddress();

        tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _tokenUris[tokenId] = tokenUri_;

        emit Transfer(address(0), to, tokenId);
    }

    function safeMintWithProof(
        address to,
        string calldata tokenUri_,
        bytes32 visitProofHash,
        string calldata regionCode,
        string calldata campaignId,
        string calldata metadataCID
    ) external onlyMinter returns (uint256 tokenId) {
        tokenId = safeMint(to, tokenUri_);
        _visitMintProofs[tokenId] = VisitMintProof({
            visitProofHash: visitProofHash,
            regionCode: regionCode,
            campaignId: campaignId,
            metadataCID: metadataCID,
            mintedAt: uint64(block.timestamp)
        });
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert TokenDoesNotExist();
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _tokenUris[tokenId];
    }

    function getVisitMintProof(uint256 tokenId) external view returns (VisitMintProof memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _visitMintProofs[tokenId];
    }
}
