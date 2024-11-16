import React, { useState, useEffect } from 'react';
import './index.css';

import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import {
  DataLocationOffChain,
  EvmChains,
  OffChainRpc,
  OffChainSignType,
  OnChainAttestation,
  SignProtocolClient,
  SpMode,
  delegateSignAttestation,
  delegateSignRevokeAttestation,
  delegateSignSchema,
  IndexService,
  RecipientEncodingType,
  SchemaItem,
} from '../../../src';
import { Attestation } from '../../../dist/types';
import { OnChainClient } from '../../../src/clients/evm/OnChain';
import { polygonMumbai } from 'viem/chains';

export const GettingStarted: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [privateKey, setPrivateKey] = useState<any>(
    '0xd42f56bb4e4d030ec94b5f8fd757d351017d3e337cc675f624d77cca77240141'
  );
  const [schemaId, setSchemaId] = useState<any>('');
  const [attestationId, setAttestationId] = useState<any>('0x1');
  const [schema, setSchema] = useState<any>(
    JSON.stringify({
      name: 'test',
      description: 'description',
      data: [{ name: 'info', type: 'string' }],
      hook: '0x469EbEC8E2216c5f1986174b868df9bF9131fbcd',
    })
  );
  const [attestation, setAttestation] = useState<any>(
    JSON.stringify({
      schemaId: '0x92',
      data: { test: ['lalala'] },
      indexingValue: 'xxx',
      recipients: ['0x059e6B8008d34aC26581fD3ED8378AA93c7941EE'],
      linkedAttestationId: '0x12e',
    } as Attestation)
  );
  const [offChainClient, setOffChainClient] = useState<SignProtocolClient>();
  const [onChainClient, setOnChainClient] = useState<SignProtocolClient>();
  useEffect(() => {
    const offChainClient = new SignProtocolClient(SpMode.OffChain, {
      signType: OffChainSignType.EvmEip712,
      // rpcUrl: 'http://43.198.156.58:3020/api',
      rpcUrl: OffChainRpc.testnet,
      // account: privateKeyToAccount(privateKey),
    });
    setOffChainClient(offChainClient);
    const onChainClient = new SignProtocolClient(SpMode.OnChain, {
      chain: EvmChains.arbitrumSepolia,
      // walletClient: createWalletClient({
      //   chain: polygonMumbai,
      //   transport: http(),
      // }),
      //rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      account: privateKeyToAccount(privateKey),
    });
    setOnChainClient(onChainClient);
  }, []);

  const getSchemaOffChain = async () => {
    const client = offChainClient;
    const res = await client.getSchema(schemaId);
    setResult(res);
  };
  const getSchemaOnChain = async () => {
    const client = onChainClient;
    const res = await client.getSchema(schemaId);
    setResult(res);
  };

  const getAttestationOffChain = async () => {
    const attestationId = 'SPA_nxuvnshAptcDS2kjNRRYc';
    const client = offChainClient;
    const res = await client.getAttestation(attestationId);
    setResult(res);
  };

  const getAttestationOnChain = async () => {
    const client = onChainClient;
    const res = await client.getAttestation(attestationId);
    console.log(res);
    setResult(res);
  };
  const createSchema = async () => {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const client: SignProtocolClient = offChainClient;
    const res = await client!.createSchema(JSON.parse(schema));
    setResult(res);
  };
  const createAttestation = async () => {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const client = offChainClient;
    const res = await client.createAttestation(JSON.parse(attestation));
    setResult(res);
  };

  async function createSchemaOnChain() {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const client = onChainClient as OnChainClient;
    // const info = await delegateSignSchema(JSON.parse(schema), {
    //   chain: EvmChains.polygonMumbai,
    //   delegationAccount: privateKey
    //     ? privateKeyToAccount(privateKey)
    //     : undefined,
    // })
    const res = await client.createSchema(JSON.parse(schema), {
      // delegationSignature: info.delegationSignature,
    });
    setResult(res);
  }

  async function createAttestationOnChain() {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const info = await delegateSignAttestation(JSON.parse(attestation), {
      chain: EvmChains.arbitrumSepolia,
    });

    const res = await onChainClient.createAttestation(info.attestation, {
      resolverFeesETH: BigInt(10000),
      delegationSignature: info.delegationSignature,
      // getTxHash(txHash) {
      //   console.log('txHash', txHash);
      // },
      //recipientEncodingType: RecipientEncodingType.Address,
      account: privateKeyToAccount(privateKey),
      // extraData: '0x1234',
    });
    setResult(res);

    // const res = await client!.createAttestation(JSON.parse(attestation))
  }

  async function revokeAttestationOnChain() {
    const client = onChainClient as OnChainClient;
    /*  const info = await delegateSignRevokeAttestation(attestationId, {
      chain: EvmChains.polygonMumbai,
      // reason: 'test',
      delegationAccount: privateKey
        ? privateKeyToAccount(privateKey)
        : undefined,
    }) */
    const res = await client!.revokeAttestation(attestationId, {
      reason: 'test',
      // delegationSignature: info.delegationSignature,
    });
    setResult(res);
  }

  async function revokeAttestation() {
    const client = offChainClient as OnChainClient;

    const res = await client!.revokeAttestation(attestationId, {
      reason: 'test revoke',
    });

    setResult(res);
  }
  async function getSchemaListFromIndexService() {
    const indexService = new IndexService('testnet');
    const res = await indexService.querySchemaList({ page: 1 });
    setResult(res);
  }

  async function getSchemaFromIndexService() {
    const indexService = new IndexService('testnet');
    const res = await indexService.querySchema('sssSPS_lgX_25pVykYTKKZhRUGI3');
    setResult(res);
  }

  async function getAttestationListFromIndexService() {
    const indexService = new IndexService('testnet');
    const res = await indexService.queryAttestationList({ page: 1 });
    setResult(res);
  }
  async function getAttestationFromIndexService() {
    const indexService = new IndexService('testnet');
    const res = await indexService.queryAttestation('onchain_evm_80001_0x1');
    setResult(res);
  }

  return (
    <div>
      <div>
        <div>
          privateKey:
          <input
            type='text'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div>
        <div>
          schemaId:
          <input
            type='text'
            value={schemaId}
            onChange={(e) => setSchemaId(e.target.value)}
          />
        </div>
        <div>
          attestationId:
          <input
            type='text'
            value={attestationId}
            onChange={(e) => setAttestationId(e.target.value)}
          />
        </div>
        <div>
          schema:
          <textarea
            type='text'
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
          />
        </div>
        <div>
          attestation:
          <textarea
            type='text'
            value={attestation}
            onChange={(e) => setAttestation(e.target.value)}
          />
        </div>
        <div>OffChain</div>
        <button onClick={createSchema}>创建 schema </button>
        <button onClick={createAttestation}>创建 attestation</button>
        <button onClick={getSchemaOffChain}>获取 schema </button>
        <button onClick={getAttestationOffChain}>获取 attestation</button>
        <button onClick={revokeAttestation}>撤销 attestation</button>
        <div>OnChain</div>
        <button onClick={createSchemaOnChain}>创建 schema </button>
        <button onClick={createAttestationOnChain}>创建 attestation</button>
        <button onClick={getSchemaOnChain}>获取 schema </button>
        <button onClick={getAttestationOnChain}>获取 attestation</button>
        <button onClick={revokeAttestationOnChain}>撤销 attestation</button>
        <div>Index Service</div>
        <button onClick={getSchemaFromIndexService}>
          获取 schema from index service{' '}
        </button>
        <button onClick={getSchemaListFromIndexService}>
          获取 schema list from index service{' '}
        </button>
        <button onClick={getAttestationFromIndexService}>
          获取 attestation from index service
        </button>
        <button onClick={getAttestationListFromIndexService}>
          获取 attestation list from index service{' '}
        </button>
      </div>
      <div>
        result
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
};