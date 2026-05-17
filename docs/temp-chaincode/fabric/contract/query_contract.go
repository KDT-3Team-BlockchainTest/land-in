package contract

import (
	"encoding/json"
	"fmt"

	"landin/temp-chaincode/fabric/model"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type QueryContract struct {
	contractapi.Contract
}

func (c *QueryContract) GetVisitHistoryByUser(
	ctx contractapi.TransactionContextInterface,
	userIDHash string,
) ([]*model.Visit, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey("visitByUser", []string{userIDHash})
	if err != nil {
		return nil, fmt.Errorf("failed to get visit history: %w", err)
	}
	defer iterator.Close()

	var visits []*model.Visit
	for iterator.HasNext() {
		item, err := iterator.Next()
		if err != nil {
			return nil, err
		}

		_, parts, err := ctx.GetStub().SplitCompositeKey(item.Key)
		if err != nil || len(parts) < 2 {
			continue
		}

		visit, err := new(VisitContract).GetVisit(ctx, parts[1])
		if err == nil {
			visits = append(visits, visit)
		}
	}

	return visits, nil
}

func (c *QueryContract) GetRewardHistoryByUser(
	ctx contractapi.TransactionContextInterface,
	userIDHash string,
) ([]*model.RewardLedgerEntry, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey("rewardByUser", []string{userIDHash})
	if err != nil {
		return nil, fmt.Errorf("failed to get reward history: %w", err)
	}
	defer iterator.Close()

	var rewards []*model.RewardLedgerEntry
	for iterator.HasNext() {
		item, err := iterator.Next()
		if err != nil {
			return nil, err
		}

		rewardID := string(item.Value)
		data, err := ctx.GetStub().GetState("reward:" + rewardID)
		if err != nil || data == nil {
			continue
		}

		var reward model.RewardLedgerEntry
		if err := json.Unmarshal(data, &reward); err != nil {
			continue
		}

		rewards = append(rewards, &reward)
	}

	return rewards, nil
}
