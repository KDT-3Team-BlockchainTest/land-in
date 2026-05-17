package main

import (
	"landin/temp-chaincode/fabric/contract"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc, err := contractapi.NewChaincode(
		new(contract.VisitContract),
		new(contract.NftRecordContract),
		new(contract.RewardContract),
		new(contract.QueryContract),
	)
	if err != nil {
		panic(err.Error())
	}

	if err := cc.Start(); err != nil {
		panic(err.Error())
	}
}
