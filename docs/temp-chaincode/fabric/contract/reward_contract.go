package contract

import (
	"encoding/json"
	"fmt"
	"strconv"

	"landin/temp-chaincode/fabric/model"
	"landin/temp-chaincode/fabric/pkg"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type RewardContract struct {
	contractapi.Contract
}

func (c *RewardContract) GrantPointAfterNFTMint(
	ctx contractapi.TransactionContextInterface,
	rewardTxID string,
	visitID string,
	mintRecordID string,
	userIDHash string,
	campaignID string,
	pointAmount string,
	grantedAt string,
) error {
	amount, err := strconv.Atoi(pointAmount)
	if err != nil || amount <= 0 {
		return fmt.Errorf("invalid point amount")
	}

	existing, err := ctx.GetStub().GetState(pkg.RewardKey(rewardTxID))
	if err != nil {
		return fmt.Errorf("failed to read reward record: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("reward already exists: %s", rewardTxID)
	}

	entry := model.RewardLedgerEntry{
		RewardTxID:   rewardTxID,
		UserIDHash:   userIDHash,
		VisitID:      visitID,
		MintRecordID: mintRecordID,
		CampaignID:   campaignID,
		PointAmount:  amount,
		RewardType:   "GRANT",
		Status:       "REWARD_GRANTED",
		GrantedAt:    grantedAt,
		FabricTxID:   ctx.GetStub().GetTxID(),
	}

	payload, err := json.Marshal(entry)
	if err != nil {
		return fmt.Errorf("failed to marshal reward entry: %w", err)
	}

	if err := ctx.GetStub().PutState(pkg.RewardKey(rewardTxID), payload); err != nil {
		return fmt.Errorf("failed to save reward entry: %w", err)
	}

	userKey, err := ctx.GetStub().CreateCompositeKey("rewardByUser", []string{userIDHash, rewardTxID})
	if err != nil {
		return fmt.Errorf("failed to create reward composite key: %w", err)
	}

	return ctx.GetStub().PutState(userKey, []byte(rewardTxID))
}

func (c *RewardContract) UsePoint(
	ctx contractapi.TransactionContextInterface,
	rewardUseTxID string,
	userIDHash string,
	partnerID string,
	pointAmount string,
	usedAt string,
) error {
	amount, err := strconv.Atoi(pointAmount)
	if err != nil || amount <= 0 {
		return fmt.Errorf("invalid point amount")
	}

	entry := model.RewardLedgerEntry{
		RewardTxID:   rewardUseTxID,
		UserIDHash:   userIDHash,
		VisitID:      "",
		MintRecordID: "",
		CampaignID:   partnerID,
		PointAmount:  -amount,
		RewardType:   "USE",
		Status:       "POINT_USED",
		GrantedAt:    usedAt,
		FabricTxID:   ctx.GetStub().GetTxID(),
	}

	payload, err := json.Marshal(entry)
	if err != nil {
		return fmt.Errorf("failed to marshal point use entry: %w", err)
	}

	return ctx.GetStub().PutState(pkg.RewardKey(rewardUseTxID), payload)
}
