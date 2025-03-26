// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title SciFund
 * @dev Main contract for the SciFund platform
 */
contract SciFund is Initializable, ERC721Upgradeable, PausableUpgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Project status enum
    enum ProjectStatus { 
        Draft,
        Active,
        Funded,
        Completed,
        Cancelled
    }

    // Project structure
    struct Project {
        address researcher;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 deadline;
        ProjectStatus status;
        string ipfsHash;  // For storing detailed project data
    }

    // Research output NFT structure
    struct ResearchOutput {
        uint256 projectId;
        string title;
        string ipfsHash;
        uint256 timestamp;
    }

    // State variables
    CountersUpgradeable.Counter private _projectIds;
    CountersUpgradeable.Counter private _tokenIds;
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => ResearchOutput) public researchOutputs;
    mapping(uint256 => mapping(address => uint256)) public projectContributions;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed researcher, string title);
    event ProjectFunded(uint256 indexed projectId, address indexed funder, uint256 amount);
    event ResearchOutputMinted(uint256 indexed projectId, uint256 indexed tokenId, string ipfsHash);
    event ProjectStatusUpdated(uint256 indexed projectId, ProjectStatus status);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("SciFund Research Output", "SCIF");
        __Pausable_init();
        __Ownable_init();
    }

    /**
     * @dev Creates a new research project
     */
    function createProject(
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 durationInDays,
        string memory ipfsHash
    ) external returns (uint256) {
        require(fundingGoal > 0, "Funding goal must be greater than 0");
        require(durationInDays > 0 && durationInDays <= 365, "Duration must be between 1 and 365 days");

        _projectIds.increment();
        uint256 projectId = _projectIds.current();

        projects[projectId] = Project({
            researcher: msg.sender,
            title: title,
            description: description,
            fundingGoal: fundingGoal,
            currentFunding: 0,
            deadline: block.timestamp + (durationInDays * 1 days),
            status: ProjectStatus.Active,
            ipfsHash: ipfsHash
        });

        emit ProjectCreated(projectId, msg.sender, title);
        return projectId;
    }

    /**
     * @dev Allows users to fund a project
     */
    function fundProject(uint256 projectId) external payable {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project is not active");
        require(block.timestamp < project.deadline, "Project deadline has passed");
        require(msg.value > 0, "Funding amount must be greater than 0");

        project.currentFunding += msg.value;
        projectContributions[projectId][msg.sender] += msg.value;

        if (project.currentFunding >= project.fundingGoal) {
            project.status = ProjectStatus.Funded;
            emit ProjectStatusUpdated(projectId, ProjectStatus.Funded);
        }

        emit ProjectFunded(projectId, msg.sender, msg.value);
    }

    /**
     * @dev Mints a new research output NFT
     */
    function mintResearchOutput(
        uint256 projectId,
        string memory title,
        string memory ipfsHash
    ) external returns (uint256) {
        Project storage project = projects[projectId];
        require(msg.sender == project.researcher, "Only researcher can mint outputs");
        require(project.status == ProjectStatus.Funded || project.status == ProjectStatus.Completed, 
                "Project must be funded or completed");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);

        researchOutputs[tokenId] = ResearchOutput({
            projectId: projectId,
            title: title,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        emit ResearchOutputMinted(projectId, tokenId, ipfsHash);
        return tokenId;
    }

    /**
     * @dev Updates project status
     */
    function updateProjectStatus(uint256 projectId, ProjectStatus newStatus) external {
        Project storage project = projects[projectId];
        require(msg.sender == project.researcher || msg.sender == owner(), "Unauthorized");
        require(project.status != newStatus, "Status already set");
        
        project.status = newStatus;
        emit ProjectStatusUpdated(projectId, newStatus);
    }

    // Pause/Unpause functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Override required functions
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
} 