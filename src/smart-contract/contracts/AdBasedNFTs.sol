//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/IPaymentSplitter.sol";

contract AdBasedNFTs is ERC721Enumerable, Ownable, ChainlinkClient {
    event AdAmountExhausted(uint256 tokenId);
    using Chainlink for Chainlink.Request;
    using Strings for uint256;
    string baseURI = "";
    uint256 DIV_MULTIPLIER_PER_CLICK = 0.001 ether;
    mapping(uint256 => metadata) public _tokenInfo;
    mapping(bytes32 => uint256) _requestedData;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    address private _paymentSplitter;
    struct metadata {
        uint256 tokenId;
        address ownerOfWebsite;
        uint256 clicks;
        uint256 amount;
    }

    constructor(string memory _baseTokenURI, address paymentSplitter, address _link)
    ERC721("Ad Tokertize", "aTKTZ")
    {
        setPaymentSplitter(paymentSplitter);
        setbaseURI(_baseTokenURI);
        if(_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10**18;
    }

    function mintAdToken(
        uint256 _adCode
    ) public payable returns (uint256) {
        require(!_exists(_adCode));
        _tokenInfo[_adCode] = metadata(_adCode, msg.sender, 0, msg.value);
        require(IPaymentSplitter(_paymentSplitter).addAdAccount{value: msg.value}(msg.sender, _adCode) == _adCode,"Error in creating account in payments");
        _safeMint(msg.sender, _adCode);
        return _adCode;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function setbaseURI(string memory _tokenURI) public onlyOwner {
        baseURI = _tokenURI;
    }
    
    function getTokenData() public view returns (metadata[] memory) {
        uint256 lastTokenIndex = totalSupply();
        metadata[] memory ret = new metadata[](lastTokenIndex);
        for (uint256 i = 0; i < lastTokenIndex; i++) {
            ret[i] = _tokenInfo[tokenByIndex(i)];
        }
        return ret;
    }

    function setPaymentSplitter(address paymentSplitter) public onlyOwner {
        require(
            address(paymentSplitter) != address(0) ||
            address(paymentSplitter) != address(this),
            "Cannot update the payment splitter address"
        );
        _paymentSplitter = paymentSplitter;
    }

    function updateDivMultiplier(uint256 minAmount) external onlyOwner {
        DIV_MULTIPLIER_PER_CLICK = minAmount;
    }

    function requestTokenData(uint256 tokenId) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.updateTokenData.selector
        );

        // Set the URL to perform the GET request on

        request.add(
            "get",
            string(
                abi.encodePacked(
                    "https://nftmarathon.xyz/api/oracle/ads/",
                    tokenId.toString(),
                    "/clicks/0"
                )
            )
        );

        request.add("path", "clicks");
        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        _requestedData[requestId] = tokenId;

        // Sends the request
        return requestId;
    }

    function updateTokenData(bytes32 _requestId, uint256 _clicks)
    public
    recordChainlinkFulfillment(_requestId)
    {
        require(
            _clicks > _tokenInfo[_requestedData[_requestId]].clicks,
            "Clicks should be greater than prev clicks"
        );
        uint256 updatedNumber = _clicks -
        _tokenInfo[_requestedData[_requestId]].clicks;
        uint256 payment = (updatedNumber * DIV_MULTIPLIER_PER_CLICK);
        if(_tokenInfo[_requestedData[_requestId]].amount < payment){
            emit AdAmountExhausted(_requestedData[_requestId]);
        }
        require(_tokenInfo[_requestedData[_requestId]].amount < payment, "Amount exhausted for the Ad token");
        _tokenInfo[_requestedData[_requestId]].amount -= payment;
        _tokenInfo[_requestedData[_requestId]].clicks = _clicks;
    }
}
