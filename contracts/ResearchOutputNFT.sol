// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ResearchOutputNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ResearchOutput {
        string title;
        string description;
        string ipfsHash;
        address researcher;
        uint256 totalContributions;
        uint256 totalRewards;
        bool rewardsDistributed;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    mapping(uint256 => ResearchOutput) public researchOutputs;
    mapping(address => uint256[]) public researcherOutputs;
    mapping(address => uint256[]) public contributorOutputs;

    event ResearchOutputCreated(
        uint256 indexed tokenId,
        string title,
        address indexed researcher
    );
    event ContributionAdded(
        uint256 indexed tokenId,
        address indexed contributor,
        uint256 amount
    );
    event RewardsDistributed(
        uint256 indexed tokenId,
        uint256 totalAmount
    );

    constructor() ERC721("Research Output NFT", "RONFT") {}

    function createResearchOutput(
        string memory title,
        string memory description,
        string memory ipfsHash
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);

        ResearchOutput storage output = researchOutputs[newTokenId];
        output.title = title;
        output.description = description;
        output.ipfsHash = ipfsHash;
        output.researcher = msg.sender;
        output.totalContributions = 0;
        output.totalRewards = 0;
        output.rewardsDistributed = false;

        researcherOutputs[msg.sender].push(newTokenId);

        emit ResearchOutputCreated(newTokenId, title, msg.sender);

        return newTokenId;
    }

    function addContribution(uint256 tokenId, address contributor) public {
        require(_exists(tokenId), "Research output does not exist");
        require(contributor != address(0), "Invalid contributor address");

        ResearchOutput storage output = researchOutputs[tokenId];
        
        if (output.contributions[contributor] == 0) {
            output.contributors.push(contributor);
            contributorOutputs[contributor].push(tokenId);
        }
        
        output.contributions[contributor]++;
        output.totalContributions++;

        emit ContributionAdded(tokenId, contributor, 1);
    }

    function distributeRewards(uint256 tokenId) public payable {
        require(_exists(tokenId), "Research output does not exist");
        require(msg.value > 0, "No rewards to distribute");
        require(!researchOutputs[tokenId].rewardsDistributed, "Rewards already distributed");

        ResearchOutput storage output = researchOutputs[tokenId];
        output.totalRewards = msg.value;
        output.rewardsDistributed = true;

        uint256 totalContributions = output.totalContributions;
        require(totalContributions > 0, "No contributions to reward");

        uint256 rewardPerContribution = msg.value / totalContributions;
        uint256 remainingRewards = msg.value;

        for (uint256 i = 0; i < output.contributors.length; i++) {
            address contributor = output.contributors[i];
            uint256 contributionCount = output.contributions[contributor];
            uint256 contributorReward = rewardPerContribution * contributionCount;
            
            if (contributorReward > 0) {
                (bool success, ) = contributor.call{value: contributorReward}("");
                require(success, "Reward transfer failed");
                remainingRewards -= contributorReward;
            }
        }

        // Send any remaining rewards to the researcher
        if (remainingRewards > 0) {
            (bool success, ) = output.researcher.call{value: remainingRewards}("");
            require(success, "Researcher reward transfer failed");
        }

        emit RewardsDistributed(tokenId, msg.value);
    }

    function getResearchOutput(uint256 tokenId) public view returns (
        string memory title,
        string memory description,
        string memory ipfsHash,
        address researcher,
        uint256 totalContributions,
        uint256 totalRewards,
        bool rewardsDistributed
    ) {
        require(_exists(tokenId), "Research output does not exist");
        ResearchOutput storage output = researchOutputs[tokenId];
        return (
            output.title,
            output.description,
            output.ipfsHash,
            output.researcher,
            output.totalContributions,
            output.totalRewards,
            output.rewardsDistributed
        );
    }

    function getContributorReward(uint256 tokenId, address contributor) public view returns (uint256) {
        require(_exists(tokenId), "Research output does not exist");
        ResearchOutput storage output = researchOutputs[tokenId];
        require(output.rewardsDistributed, "Rewards not distributed yet");
        
        uint256 contributionCount = output.contributions[contributor];
        if (contributionCount == 0) return 0;
        
        return (output.totalRewards * contributionCount) / output.totalContributions;
    }

    function getResearcherOutputs(address researcher) public view returns (uint256[] memory) {
        return researcherOutputs[researcher];
    }

    function getContributorOutputs(address contributor) public view returns (uint256[] memory) {
        return contributorOutputs[contributor];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        
        if (from != address(0)) {
            // Remove from previous owner's list
            uint256[] storage fromOutputs = researcherOutputs[from];
            for (uint256 i = 0; i < fromOutputs.length; i++) {
                if (fromOutputs[i] == tokenId) {
                    fromOutputs[i] = fromOutputs[fromOutputs.length - 1];
                    fromOutputs.pop();
                    break;
                }
            }
        }
        
        if (to != address(0)) {
            // Add to new owner's list
            researcherOutputs[to].push(tokenId);
        }
    }
} 