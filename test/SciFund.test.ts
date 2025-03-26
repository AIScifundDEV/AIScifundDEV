import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SciFund } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SciFund", function () {
  let sciFund: SciFund;
  let owner: SignerWithAddress;
  let researcher: SignerWithAddress;
  let funder: SignerWithAddress;

  beforeEach(async function () {
    [owner, researcher, funder] = await ethers.getSigners();
    
    const SciFundFactory = await ethers.getContractFactory("SciFund");
    sciFund = await upgrades.deployProxy(SciFundFactory) as SciFund;
    await sciFund.deployed();
  });

  describe("Project Creation", function () {
    it("Should create a new project", async function () {
      const projectData = {
        title: "Test Research Project",
        description: "A test project for scientific research",
        fundingGoal: ethers.utils.parseEther("1.0"),
        durationInDays: 30,
        ipfsHash: "QmTest123"
      };

      await expect(sciFund.connect(researcher).createProject(
        projectData.title,
        projectData.description,
        projectData.fundingGoal,
        projectData.durationInDays,
        projectData.ipfsHash
      ))
        .to.emit(sciFund, "ProjectCreated")
        .withArgs(1, researcher.address, projectData.title);

      const project = await sciFund.projects(1);
      expect(project.researcher).to.equal(researcher.address);
      expect(project.title).to.equal(projectData.title);
      expect(project.fundingGoal).to.equal(projectData.fundingGoal);
    });

    it("Should fail with invalid funding goal", async function () {
      await expect(sciFund.connect(researcher).createProject(
        "Test Project",
        "Description",
        0,
        30,
        "QmTest123"
      )).to.be.revertedWith("Funding goal must be greater than 0");
    });
  });

  describe("Project Funding", function () {
    beforeEach(async function () {
      await sciFund.connect(researcher).createProject(
        "Test Project",
        "Description",
        ethers.utils.parseEther("1.0"),
        30,
        "QmTest123"
      );
    });

    it("Should allow funding a project", async function () {
      const fundingAmount = ethers.utils.parseEther("0.5");
      
      await expect(sciFund.connect(funder).fundProject(1, { value: fundingAmount }))
        .to.emit(sciFund, "ProjectFunded")
        .withArgs(1, funder.address, fundingAmount);

      const project = await sciFund.projects(1);
      expect(project.currentFunding).to.equal(fundingAmount);
    });

    it("Should update status when fully funded", async function () {
      const fundingAmount = ethers.utils.parseEther("1.0");
      
      await expect(sciFund.connect(funder).fundProject(1, { value: fundingAmount }))
        .to.emit(sciFund, "ProjectStatusUpdated")
        .withArgs(1, 2); // 2 = Funded status

      const project = await sciFund.projects(1);
      expect(project.status).to.equal(2);
    });
  });

  describe("Research Output NFT", function () {
    beforeEach(async function () {
      await sciFund.connect(researcher).createProject(
        "Test Project",
        "Description",
        ethers.utils.parseEther("1.0"),
        30,
        "QmTest123"
      );
      
      await sciFund.connect(funder).fundProject(1, {
        value: ethers.utils.parseEther("1.0")
      });
    });

    it("Should mint research output NFT", async function () {
      await expect(sciFund.connect(researcher).mintResearchOutput(
        1,
        "Research Result",
        "QmResult123"
      ))
        .to.emit(sciFund, "ResearchOutputMinted")
        .withArgs(1, 1, "QmResult123");

      const output = await sciFund.researchOutputs(1);
      expect(output.projectId).to.equal(1);
      expect(output.title).to.equal("Research Result");
      expect(output.ipfsHash).to.equal("QmResult123");
    });

    it("Should fail when non-researcher tries to mint", async function () {
      await expect(sciFund.connect(funder).mintResearchOutput(
        1,
        "Research Result",
        "QmResult123"
      )).to.be.revertedWith("Only researcher can mint outputs");
    });
  });
}); 