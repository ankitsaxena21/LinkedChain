const LinkedChain = artifacts.require('./LinkedChain.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('LinkedChain', ([deployer, author, tipper]) => {
  let linkedChain

  before(async () => {
    linkedChain = await LinkedChain.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await linkedChain.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await linkedChain.name()
      assert.equal(name, 'LinkedChain')
    })
  })

  describe('posts', async () => {
    let result, postCount, result2

    before(async () => {
      result = await linkedChain.createQuestion('How to become a blockchain developer?', { from: author })
      postCount = await linkedChain.postCount()
      result2 = await linkedChain.createAnswer(postCount, 'Learn solidity programming', { from: author })
    })

    it('creates questions', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.question, 'How to become a blockchain developer?', 'question is correct')
      assert.equal(event.author, author, 'author is correct')

      await linkedChain.createQuestion('', { from: author }).should.be.rejected;
    })

    it('lists questions', async () => {
      const question = await linkedChain.questions(postCount)
      assert.equal(question.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(question.question, 'How to become a blockchain developer?', 'question is correct')
      assert.equal(question.ansCount, '1', 'number of answers is correct')
      assert.equal(question.author, author, 'author is correct')
    })

    it('lists answers', async () => {
      const answer = await linkedChain.getAnswer(postCount, postCount)
      assert.equal(answer[0].toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(answer[1], 'Learn solidity programming', 'answer is correct')
      assert.equal(answer[2], '0', 'number of answers is correct')
      assert.equal(answer[3], author, 'author is correct')
    })


    it('creates answers', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result2.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.answer, 'Learn solidity programming', 'answer is correct')
      assert.equal(event.author, author, 'author is correct')

      await linkedChain.createQuestion('', { from: author }).should.be.rejected;
    })

    it('allows users to tip answers', async () => {
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await linkedChain.tipAnswer(postCount, postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const exepectedBalance = oldAuthorBalance.add(tipAmount)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await linkedChain.tipAnswer(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
