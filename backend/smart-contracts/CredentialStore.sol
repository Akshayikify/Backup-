// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CredentialStore
 * @dev Store and verify credentials on blockchain
 */
contract CredentialStore {
    struct Credential {
        uint256 credentialId;
        string cid; // IPFS CID
        string hash; // Document hash
        address issuer;
        address owner;
        uint256 createdAt;
        bool revoked;
        bool exists;
    }

    mapping(string => Credential) public credentials; // hash => Credential
    mapping(uint256 => string) public credentialIdToHash;
    uint256 public nextCredentialId;

    event CredentialStored(
        uint256 indexed credentialId,
        string cid,
        string hash,
        address indexed issuer,
        address indexed owner
    );

    event CredentialRevoked(
        string indexed hash,
        address indexed issuer
    );

    /**
     * @dev Store a credential
     * @param cid IPFS CID of the document
     * @param hash SHA256 hash of the document
     * @param issuer Address of the credential issuer
     * @param owner Address of the credential owner
     */
    function storeCredential(
        string memory cid,
        string memory hash,
        address issuer,
        address owner
    ) public returns (uint256) {
        require(bytes(hash).length > 0, "Hash cannot be empty");
        require(!credentials[hash].exists, "Credential with this hash already exists");
        require(issuer == msg.sender, "Only issuer can store the credential");

        uint256 credentialId = nextCredentialId;
        nextCredentialId++;

        Credential memory newCredential = Credential({
            credentialId: credentialId,
            cid: cid,
            hash: hash,
            issuer: issuer,
            owner: owner,
            createdAt: block.timestamp,
            revoked: false,
            exists: true
        });

        credentials[hash] = newCredential;
        credentialIdToHash[credentialId] = hash;

        emit CredentialStored(credentialId, cid, hash, issuer, owner);

        return credentialId;
    }

    /**
     * @dev Verify a credential
     * @param hash Document hash to verify
     * @return isValid True if credential is valid
     * @return issuer Address of the issuer
     * @return owner Address of the owner
     * @return createdAt Creation timestamp
     */
    function verifyCredential(string memory hash) public view returns (
        bool isValid,
        address issuer,
        address owner,
        uint256 createdAt
    ) {
        Credential memory cred = credentials[hash];
        
        if (!cred.exists) {
            return (false, address(0), address(0), 0);
        }

        isValid = !cred.revoked;
        issuer = cred.issuer;
        owner = cred.owner;
        createdAt = cred.createdAt;
    }

    /**
     * @dev Revoke a credential
     * @param hash Document hash to revoke
     */
    function revokeCredential(string memory hash) public {
        require(credentials[hash].exists, "Credential does not exist");
        require(credentials[hash].issuer == msg.sender, "Only issuer can revoke");

        credentials[hash].revoked = true;

        emit CredentialRevoked(hash, msg.sender);
    }

    /**
     * @dev Get credential by hash
     * @param hash Document hash
     * @return credentialId Credential identifier
     * @return cid IPFS CID
     * @return issuer Issuer address
     * @return owner Owner address
     * @return createdAt Creation timestamp
     * @return revoked Revocation status
     */
    function getCredential(string memory hash) public view returns (
        uint256 credentialId,
        string memory cid,
        address issuer,
        address owner,
        uint256 createdAt,
        bool revoked
    ) {
        require(credentials[hash].exists, "Credential does not exist");
        Credential memory cred = credentials[hash];
        return (cred.credentialId, cred.cid, cred.issuer, cred.owner, cred.createdAt, cred.revoked);
    }

    /**
     * @dev Check if credential exists
     * @param hash Document hash
     * @return bool True if credential exists
     */
    function credentialExists(string memory hash) public view returns (bool) {
        return credentials[hash].exists;
    }
}

