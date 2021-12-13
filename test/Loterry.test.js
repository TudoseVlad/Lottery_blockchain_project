const assert  = require('assert');
const { captureRejections } = require('events');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //contructor
const web3 = new Web3(ganache.provider());

const {abi, evm} = require('../compile');

let accounts;
let lottery;

 beforeEach(async () =>{
    //Get a list of all accounts
    accounts = await web3.eth.getAccounts();
        
    
    //Use one of those accounts to deploy
    //the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object  })
        .send({ from: accounts[0], gas: '1000000' })
 });

 describe('Lottery',() =>{
     it('deploys a contract', () =>{
        assert.ok(lottery.options.address);
     }); 
    //what behavior do care about this contract???

    it('allows one account to enter', async () =>{

        
        const TicketPrice = await lottery.methods.TicketPrice().call();

        await lottery.methods.enter().send({
            from: accounts[0],
            value: TicketPrice*2
        });

        const players = await lottery.methods.listAllPlayers().call({
            from:accounts[0]
        });

        
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);

    });

    it('allows multiple account to enter', async () =>{

        const TicketPrice = await lottery.methods.TicketPrice().call();

        await lottery.methods.enter().send({
            from: accounts[0],
            value: TicketPrice * 2
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: TicketPrice * 2.5
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: TicketPrice * 1.5
        });

        const players = await lottery.methods.listAllPlayers().call({
            from:accounts[0]
        });

        
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);

        assert.equal(3, players.length);

    });

    it('requires a minimum amount of ether to enter',async() =>{

        const TicketPrice = await lottery.methods.TicketPrice().call();
        try{

            await lottery.methods.enter().send({
                from: accounts[0],
                value: TicketPrice * 0.9
            });

            assert(false);

        }catch( err ) {

            assert(err);
        }

    });

    it('requires the manager to pick winner', async() =>{
        try{

            await lottery.methods.pickWinner().send({
                from: accounts[1]
            
            });

            assert(false);

        }catch(err){

            assert(err);

        }
    });

    it('sends money to the winner and resets the players array',async() =>{
        const TicketPrice = await lottery.methods.TicketPrice().call();

        await lottery.methods.enter().send({
            from: accounts[0],
            value: TicketPrice * 5
        });

        const initialBalance = await web3.eth.getBalance(accounts[0])*0.95;
        const prizePool = await lottery.methods.prizePool().call();

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference  = finalBalance - initialBalance;
        
        assert(difference > prizePool);
        assert.equal(0, await lottery.methods.prizePool().call());
        assert.equal(0, await lottery.methods.getNumberOfPlayers().call());
        


    });

 });
