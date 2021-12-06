const BetsTest = artifacts.require("BetsTest");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("BetsTest", function (/* accounts */) {
  it("should assert true", async function () {
    await BetsTest.deployed();
    return assert.isTrue(true);
  });
});
