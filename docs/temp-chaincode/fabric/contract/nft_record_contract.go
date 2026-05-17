package contract

import (
	"encoding/json"
	"fmt"

	"landin/temp-chaincode/fabric/model"
	"landin/temp-chaincode/fabric/pkg"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type NftRecordContract struct {
	contractapi.Contract
}

func (c *NftRecordContract) RecordNFTMint(
	ctx contractapi.TransactionContextInterface,
	mintRecordID string,
	visitID string,
	draftID string,
	userIDHash string,
	tokenID string,
	ownerAddress string,
	imageCID string,
	metadataCID string,
	polygonTxHash string,
	mintedAt string,
) error {
	if mintRecordID == "" || visitID == "" || userIDHash == "" || tokenID == "" || ownerAddress == "" || metadataCID == "" {
		return fmt.Errorf("required value is missing")
	}

	existing, err := ctx.GetStub().GetState(pkg.MintKey(mintRecordID))
	if err != nil {
		return fmt.Errorf("failed to read mint record: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("mint record already exists: %s", mintRecordID)
	}

	record := model.NftMintRecord{
		MintRecordID:  mintRecordID,
		VisitID:       visitID,
		DraftID:       draftID,
		UserIDHash:    userIDHash,
		TokenID:       tokenID,
		OwnerAddress:  ownerAddress,
		ImageCID:      imageCID,
		MetadataCID:   metadataCID,
		PolygonTxHash: polygonTxHash,
		MintStatus:    "FABRIC_RECORDED",
		MintedAt:      mintedAt,
		FabricTxID:    ctx.GetStub().GetTxID(),
	}

	payload, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal mint record: %w", err)
	}

	if err := ctx.GetStub().PutState(pkg.MintKey(mintRecordID), payload); err != nil {
		return fmt.Errorf("failed to save mint record: %w", err)
	}

	visitKey, err := ctx.GetStub().CreateCompositeKey("mintByVisit", []string{visitID, mintRecordID})
	if err != nil {
		return fmt.Errorf("failed to create visit composite key: %w", err)
	}

	return ctx.GetStub().PutState(visitKey, []byte(mintRecordID))
}

func (c *NftRecordContract) GetNftMintRecord(
	ctx contractapi.TransactionContextInterface,
	mintRecordID string,
) (*model.NftMintRecord, error) {
	data, err := ctx.GetStub().GetState(pkg.MintKey(mintRecordID))
	if err != nil {
		return nil, fmt.Errorf("failed to read mint record: %w", err)
	}
	if data == nil {
		return nil, fmt.Errorf("mint record not found: %s", mintRecordID)
	}

	var record model.NftMintRecord
	if err := json.Unmarshal(data, &record); err != nil {
		return nil, fmt.Errorf("failed to unmarshal mint record: %w", err)
	}

	return &record, nil
}
