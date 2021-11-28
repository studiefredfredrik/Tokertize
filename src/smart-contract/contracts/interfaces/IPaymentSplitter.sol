// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IPaymentSplitter {

    function addAdAccount(address _adOwner, uint256 tokenId) external payable returns (uint256);

    function addWebAccount(address _webOwner, uint256 tokenId) external returns (uint256);
}