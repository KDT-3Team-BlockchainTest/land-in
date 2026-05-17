package contract

import (
	"encoding/json"
	"fmt"

	"landin/temp-chaincode/fabric/model"
	"landin/temp-chaincode/fabric/pkg"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type VisitContract struct {
	contractapi.Contract
}

func (c *VisitContract) VerifyVisit(
	ctx contractapi.TransactionContextInterface,
	visitID string,
	userIDHash string,
	campaignID string,
	tagIDHash string,
	visitProofHash string,
	visitedAt string,
	locationCode string,
) error {
	if visitID == "" || userIDHash == "" || campaignID == "" || tagIDHash == "" || visitProofHash == "" {
		return fmt.Errorf("required value is missing")
	}

	stateKey := pkg.VisitKey(visitID)
	existing, err := ctx.GetStub().GetState(stateKey)
	if err != nil {
		return fmt.Errorf("failed to load visit state: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("visit already exists: %s", visitID)
	}

	visit := model.Visit{
		VisitID:        visitID,
		UserIDHash:     userIDHash,
		CampaignID:     campaignID,
		TagIDHash:      tagIDHash,
		VisitProofHash: visitProofHash,
		LocationCode:   locationCode,
		Status:         "VISIT_RECORDED",
		VisitedAt:      visitedAt,
		FabricTxID:     ctx.GetStub().GetTxID(),
	}

	payload, err := json.Marshal(visit)
	if err != nil {
		return fmt.Errorf("failed to marshal visit: %w", err)
	}

	if err := ctx.GetStub().PutState(stateKey, payload); err != nil {
		return fmt.Errorf("failed to save visit: %w", err)
	}

	userKey, err := ctx.GetStub().CreateCompositeKey("visitByUser", []string{userIDHash, visitID})
	if err != nil {
		return fmt.Errorf("failed to create user composite key: %w", err)
	}

	return ctx.GetStub().PutState(userKey, []byte(visitID))
}

func (c *VisitContract) GetVisit(ctx contractapi.TransactionContextInterface, visitID string) (*model.Visit, error) {
	data, err := ctx.GetStub().GetState(pkg.VisitKey(visitID))
	if err != nil {
		return nil, fmt.Errorf("failed to read visit: %w", err)
	}
	if data == nil {
		return nil, fmt.Errorf("visit not found: %s", visitID)
	}

	var visit model.Visit
	if err := json.Unmarshal(data, &visit); err != nil {
		return nil, fmt.Errorf("failed to unmarshal visit: %w", err)
	}

	return &visit, nil
}
