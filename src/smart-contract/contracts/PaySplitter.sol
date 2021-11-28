//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PaySplitter is Context, Ownable, ChainlinkClient {
    event PayeeAdded(address account, uint256 amount, uint256 tokenId);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);
    event PaymentReceivedByAddress(
        address from,
        uint256 amount,
        uint256 tokenId
    );
    using Strings for uint256;
    using Chainlink for Chainlink.Request;
    uint256 DIV_MULTIPLIER_PER_CLICK = 0.001 ether;
    uint256 private _totalShares;
    uint256 private _totalReleased;
    address private _owner;
    uint256 public MIN_AMOUNT_ETHER = 0.001 ether;
    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    mapping(uint256 => uint256) private _releasedPerToken;
    mapping(bytes32 => uint256) private _requestedData;
    mapping(uint256 => paymentRecord) private _paymentData;
    uint[] private _adTokens;
    uint[] private _webTokens;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    //ad token owner

    //mapping(uint256 => address) private _tokenPayees;
    // website owner
    // mapping(uint256 => address) private _adPayees;
    //
    struct _webPayees {
        uint index;
        address owner;
        uint256 tokenId;
        address currentOwner;
        uint256 amount;
        uint256 clicks;
    }

    struct paymentRecord {
        address payable account;
        uint256 amount;
    }

    struct _adPayees {
        uint index;
        address owner;
        uint256 tokenId;
        uint256 amount;
        uint256 clicks;
    }

    mapping(uint256 => _webPayees) private _webMapping;

    mapping(uint256 => _adPayees) private _adMapping;

    modifier _isWebTokenOwner(address account, uint256 tokenId) {
        require(
            _webMapping[tokenId].owner == _msgSender(),
            "Ownable: caller is not the owner of the token"
        );
        _;
    }

    modifier _isAdTokenOwner(address account, uint256 tokenId) {
        require(
            _adMapping[tokenId].owner == _msgSender(),
            "Ownable: caller is not the owner of the token"
        );
        _;
    }


    /**
     * @dev Creates an instance of `PaymentSplitter` where each account in `payees` is assigned the number of shares at
     * the matching position in the `shares` array.
     *
     * All addresses in `payees` must be non-zero. Both arrays must have the same non-zero length, and there must be no
     * duplicates in `payees`.
     */
    // constructor(address[] memory payees, uint256[] memory shares_) payable {
    //     require(payees.length == shares_.length, "PaymentSplitter: payees and shares length mismatch");
    //     require(payees.length > 0, "PaymentSplitter: no payees");

    //     for (uint256 i = 0; i < payees.length; i++) {
    //         _addPayee(payees[i], shares_[i]);
    //     }
    // }

    constructor(address _link) {
        if(_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10**18;
    }

    /**
     * @dev The Ether received will be logged with {PaymentReceived} events. Note that these events are not fully
     * reliable: it's possible for a contract to receive Ether without triggering this function. This only affects the
     * reliability of the events, and not the actual splitting of Ether.
     *
     * To learn more about this see the Solidity documentation for
     * https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function[fallback
     * functions].
     */
    receive() external payable virtual {
        emit PaymentReceived(_msgSender(), msg.value);
    }

    fallback() external payable {}

    function emergencyRefund(uint tokenId) external {

    }

    function addWebAccount(address _webOwner, uint256 tokenId) external returns (uint256){
        require(
            _webMapping[tokenId].owner == address(0),
            "account already exists"
        );
        _webTokens.push(tokenId);
        _webMapping[tokenId] = _webPayees(_webTokens[_webTokens.length - 1], _webOwner, tokenId, _webOwner, 0, 0);
        emit PayeeAdded(_webOwner, 0, tokenId);
        return tokenId;
    }

    function addAdAccount(address _adOwner, uint256 tokenId) external payable returns (uint256){
        require(
            msg.value >= MIN_AMOUNT_ETHER,
            "minimum amount of ether should be sent"
        );
        require(

            _adMapping[tokenId].owner == address(0),
            "account already exists"
        );
        _adTokens.push(tokenId);
        _adMapping[tokenId] = _adPayees(_adTokens[_adTokens.length - 1], _adOwner, tokenId, msg.value, 0);
        emit PayeeAdded(_adOwner, msg.value, tokenId);
        return tokenId;
    }

    function updateDivMultiplier(uint256 minAmount) external onlyOwner {
        DIV_MULTIPLIER_PER_CLICK = minAmount;
    }

    /**
     * @dev Getter for the total shares held by payees.
     */
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    /**
     * @dev Getter for the total amount of Ether already released.
     */
    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    /**
     * @dev Getter for the amount of shares held by an account.
     */
    function shares(address account) public view returns (uint256) {
        return _shares[account];
    }

    /**
     * @dev Getter for the amount of Ether already released to a payee.
     */
    function released(address account) public view returns (uint256) {
        return _released[account];
    }

    /**
     * @dev Getter for the address of the payee number `index`.
     */
    function adPayee(uint256 index) public view returns (uint) {
        return _adTokens[index];
    }

    /**
     * @dev Getter for the address of the payee number `index`.
     */
    function webPayee(uint256 index) public view returns (uint) {
        return _webTokens[index];
    }

    /**
     * @dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the
     * total shares and their previous withdrawals.
     */
    function releaseAdPayment(uint256 tokenId) public virtual {
        address payable account = payable(_webMapping[tokenId].owner);
        uint256 payment = _webMapping[tokenId].amount;
        _webMapping[tokenId].amount = 0;
        require(
            payment > 0,
            "PaymentSplitter: token has no pending shares to redeem"
        );
        _paymentData[tokenId] = paymentRecord(account, payment);
        _released[account] = _released[account] + payment;
        _releasedPerToken[tokenId] += payment;
        _totalReleased = _totalReleased + payment;
        Address.sendValue(account, payment);
        emit PaymentReleased(account, payment);
    }

    function withdrawWebAmount(uint256 tokenId)
    external
    _isWebTokenOwner(msg.sender, tokenId)
    returns (bytes32)
    {
        require(_webMapping[tokenId].owner != address(0),"no such web token exists");
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.updateWebTokenAmount.selector
        );

        // Set the URL to perform the GET request on

        request.add(
            "get",
            string(
                abi.encodePacked(
                    "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD/",
                    tokenId.toString()
                )
            )
        );
        request.add("path", "clicks");

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        _requestedData[requestId] = tokenId;

        // Sends the request
        return requestId;
    }

    function updateWebTokenAmount(bytes32 _requestId, uint256 clicks)
    public
    recordChainlinkFulfillment(_requestId)
    {
        require(
            clicks > _webMapping[_requestedData[_requestId]].clicks,
            "Clicks should be greater than prev clicks"
        );
        uint256 updatedNumber = clicks -
        _webMapping[_requestedData[_requestId]].clicks;
        uint256 payment = (updatedNumber * DIV_MULTIPLIER_PER_CLICK);
        _webMapping[_requestedData[_requestId]].amount += payment;
        _webMapping[_requestedData[_requestId]].clicks = clicks;
    }
}
