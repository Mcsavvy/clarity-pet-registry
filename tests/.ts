import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can register a new pet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('pet-registry', 'register-pet', [
                types.ascii("Max"),
                types.ascii("Dog"),
                types.ascii("Golden Retriever"),
                types.uint(1640995200)  // 2022-01-01
            ], wallet1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
    },
});

Clarinet.test({
    name: "Can transfer pet ownership",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // First register a pet
        let block = chain.mineBlock([
            Tx.contractCall('pet-registry', 'register-pet', [
                types.ascii("Max"),
                types.ascii("Dog"),
                types.ascii("Golden Retriever"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        // Then transfer ownership
        let transferBlock = chain.mineBlock([
            Tx.contractCall('pet-registry', 'transfer-pet', [
                types.uint(1),
                types.principal(wallet2.address)
            ], wallet1.address)
        ]);
        
        transferBlock.receipts[0].result.expectOk().expectBool(true);
        
        // Verify new ownership
        let checkBlock = chain.mineBlock([
            Tx.contractCall('pet-registry', 'is-pet-owner', [
                types.uint(1),
                types.principal(wallet2.address)
            ], wallet1.address)
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Can get pet details",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('pet-registry', 'register-pet', [
                types.ascii("Max"),
                types.ascii("Dog"),
                types.ascii("Golden Retriever"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        let getDetailsBlock = chain.mineBlock([
            Tx.contractCall('pet-registry', 'get-pet-details', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        const petDetails = getDetailsBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(petDetails['name'], "Max");
        assertEquals(petDetails['species'], "Dog");
        assertEquals(petDetails['breed'], "Golden Retriever");
    },
});
