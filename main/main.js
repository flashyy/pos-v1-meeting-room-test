'use strict';
let _ = require("lodash");
let {loadAllItems, loadPromotions} = require("../spec/fixtures");

function printReceipt(tags) {
  let formattedItems = formatedItem(tags);
  let countedBarcodes = countBarcode(formattedItems);
  let allItems = loadAllItems();
  let cartItems = buildCartItems(countedBarcodes, allItems);
  let promotions = loadPromotions();
  let promotedItems = buildPromotedItems(cartItems, promotions);


}
function formatedItem(tags) {
  return _.map((tags), tag => {
    if (tag.includes('-')) {
      let [barcode,count] = tag.split("-");
      return {barcode, count: parseFloat(count)}
    } else {
      return {barcode: tag, count: 1}
    }
  });
}

function _getExistElementByItem(array, barcode) {
  return _.find((array), element => element.barcode === barcode);
}

function countBarcode(formattedItems) {

  return _.reduce(formattedItems, (result, formattedItem) => {
    let found = _getExistElementByItem(result, formattedItem.barcode);
    if (found) {
      found.count += formattedItem.count;
    } else {
      result.push(formattedItem);
    }
    return result;
  }, []);
}
function buildCartItems(countedBarcodes, allItems) {
  return _.map((countedBarcodes), ({barcode, count})=> {
    let {name, price, unit} = _getExistElementByItem(allItems, barcode);
    return {name, price, unit, barcode, count}
  });
}
function buildPromotedItems(cartItems, promotions) {
  let currentpromotion = promotions.find((promotion) =>promotion.type === 'BUY_TWO_GET_ONE_FREE');
  return _.map((cartItems), cartItem => {
    let hasPromoted = currentpromotion.barcodes.includes(cartItem.barcode) && cartItem.count >= 3;
    let totalPrice = cartItem.price * cartItem.count;
    let saved = hasPromoted ? parseInt(cartItem.count / 3) * cartItem.price : 0;
    let payPrice = totalPrice - saved;
    return Object.assign({}, cartItem, {payPrice, saved});
  });
}

module.exports = {
  printReceipt: printReceipt,
  formatedItem: formatedItem,
  countBarcode: countBarcode,
  buildCartItems: buildCartItems,
  buildPromotedItems: buildPromotedItems,

}
