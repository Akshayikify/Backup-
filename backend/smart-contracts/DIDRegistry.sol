// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DIDRegistry
 * @dev Registry for Decentralized Identifiers (DIDs)
 */
contract DIDRegistry {
    struct DID {
        uint256 didId;
        string metadataHash; // IPFS hash of DID metadata
        string name;
        address owner;
        uint256 createdAt;
        bool exists;
    }

    mapping(address => DID) public dids;
    mapping(uint256 => address) public didIdToOwner;
    uint256 public nextDidId;

    event DIDCreated(
        address indexed owner,
        uint256 indexed didId,
        string metadataHash,
        string name
    );

    event DIDUpdated(
        address indexed owner,
        uint256 indexed didId,
        string metadataHash
    );

    /**
     * @dev Create a new DID
     * @param metadataHash IPFS hash of DID metadata
     * @param name Name of the DID
     */
    function createDID(string memory metadataHash, string memory name) public returns (uint256) {
        require(!dids[msg.sender].exists, "DID already exists for this address");
        
        uint256 didId = nextDidId;
        nextDidId++;

        DID memory newDID = DID({
            didId: didId,
            metadataHash: metadataHash,
            name: name,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        dids[msg.sender] = newDID;
        didIdToOwner[didId] = msg.sender;

        emit DIDCreated(msg.sender, didId, metadataHash, name);

        return didId;
    }

    /**
     * @dev Get DID information
     * @param owner Address of the DID owner
     * @return didId DID identifier
     * @return metadataHash IPFS hash of metadata
     * @return name Name of the DID
     * @return createdAt Creation timestamp
     */
    function getDID(address owner) public view returns (
        uint256 didId,
        string memory metadataHash,
        string memory name,
        uint256 createdAt
    ) {
        require(dids[owner].exists, "DID does not exist");
        DID memory did = dids[owner];
        return (did.didId, did.metadataHash, did.name, did.createdAt);
    }

    /**
     * @dev Update DID metadata
     * @param metadataHash New IPFS hash of DID metadata
     */
    function updateDID(string memory metadataHash) public {
        require(dids[msg.sender].exists, "DID does not exist");
        
        dids[msg.sender].metadataHash = metadataHash;

        emit DIDUpdated(msg.sender, dids[msg.sender].didId, metadataHash);
    }

    /**
     * @dev Check if DID exists
     * @param owner Address to check
     * @return bool True if DID exists
     */
    function hasDID(address owner) public view returns (bool) {
        return dids[owner].exists;
    }
}

