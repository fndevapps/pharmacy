
var PROMOTION_TYPES = {
    ITEM_PLUS_SAME_ITEM: 1,
    DISCOUNT_SAME_ITEM: 2,
    INVOICE_DISCOUNT: 3,
    //INVOICE_To_ITEM: 4, // to do
    ITEM_PLUS_ANOTHER_ITEM: 5
}
var Promotions = {
    promotions: [],
    summary: {},
    getPromotions: function (callback) {
        Data.Promotions.getPromotions({

        }, function (err, data) {
            if (err) {
                //console.error(err);
                callback ? callback([]) : false;
                Promotions.promotions = [];
                return;
            }
            Promotions.promotions = data;
            callback ? callback(data) : false;

        });

    }, checkPromotions: function (args, callback) {
        args = args || {};

        var items = args.items;
        var invoiceSubTotal = args.summary.subtotal;
        var invoiceTotal = args.summary.total;

        var _promotions = [];

        //Get the promotions
        //Loop through each promotion and get their details
        //Loop through each promotion and their details and update them based on the conditions

        //Loop though all promotions that have Results and construct the item objects that should be added to the invoice
        Promotions.getPromotions(function (promotions) {
            console.log("firas - 2 ", promotions);
            Promotions.applyConditions(promotions, {
                Items: items,
                InvoiceSubTotal: invoiceSubTotal,
                InvoiceTotal: invoiceTotal
            }, function (promotions) {
                console.log("firas - 3 ", promotions);
                console.log(promotions);
                callback ? callback(promotions) : false;
            }, function (error) {
                console.log("firas - 4 ", error);
                //console.error("Could not apply promotion: " + JSON.stringify(error));
                callback ? callback([]) : false;
            });
        }, function (error) {
            console.log("firas - 6 ", error);
            //console.error("Could not apply promotion: " + JSON.stringify(error));
            callback ? callback([]) : false;
        });
    },
    applyConditions: function (promotions, args, callback, errorCallback) {
        console.log("applyConditions");

        try {
            var items = args.Items;
            var invoiceTotal = args.InvoiceTotal;
            var invoiceSubTotal = args.InvoiceSubTotal;

            //console.error(items);
            var promotionType = 0;
            var qtyIn = 0;
            var valueIn = 0;
            var qtyOut = 0;
            var discountRate = 0;
            var promotionDetails = [];
            var promotionItems = [];
            var promotionItemResults = [];
            var promotionItemsOutput = []; //All items that I get from the promotions
            /**
             * repeatable: applies to [ITEM_PLUS_SAME_ITEM]
             * if it is set to true then the promotion will apply recursively based on the qty and factor
             * ex: IN 6, OUT 1, IN 12, OUT 3
             * repeatable(true) -> 6->1, 12->3, 18->3+1, 24->6 keeps applying the promotion recursively until the order amount is insufficient
             * repeatable(false) -> 6->1, 12->3, 18->3, 24->3 stops at the first applied promotion and makes the order amount zero to quit the loop 
             */
            var repeatable = false;

            promotions.forEach(function (promotion) {
                promotionType = promotion.typeId;
                repeatable = promotion.repeatable;

                qtyIn = 0;
                valueIn = 0;
                qtyOut = 0;
                discountRate = 0;
                promotionDetails = [];
                promotionItems = [];
                promotionItemResults = [];

                promotionDetails = promotion.promotionDetails.sort(function (a, b) {
                    return (b.qtyIn + b.valueIn) - (a.qtyIn + a.valueIn);
                });
                promotionItems = promotion.promotionItems.filter(function (promotionItem) {
                    return items.hasOwnProperty(promotionItem.itemId);
                });
                promotionItemResults = promotion.promotionItemResults;
                console.log(promotion);

                if (promotion.typeId == PROMOTION_TYPES.ITEM_PLUS_SAME_ITEM) {
                    console.log("1");

                    promotionItems.forEach(function (promotionItem) {
                        var item = items[promotionItem.itemId];
                        var orderQty = item.qty;
                        var orderAmount = item.amount;
                        var bonusQty = 0;
                        var discountAmount = 0;

                        promotionDetails.forEach(function (detail) {
                            qtyIn = detail.qtyIn;
                            valueIn = detail.valueIn;
                            qtyOut = detail.qtyOut;
                            discountRate = detail.discountRate;
                            bonusQty = 0;
                            discountAmount = 0;

                            var factor = 0;

                            if (qtyIn > 0 && orderQty >= qtyIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderQty / qtyIn);
                                } else {
                                    factor = 1;
                                }

                                orderQty = repeatable ? (orderQty - (qtyIn * factor)) : 0;
                                bonusQty = factor * qtyOut;
                                discountAmount = (bonusQty * item.price) * (discountRate / 100);
                            }
                            else if (valueIn > 0 && orderAmount >= valueIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderAmount / valueIn);
                                } else {
                                    factor = 1;
                                }

                                orderAmount = repeatable ? (orderAmount - (valueIn * factor)) : 0;
                                bonusQty = factor * qtyOut;
                                discountAmount = (bonusQty * item.price) * (discountRate / 100);
                            }

                            if (bonusQty > 0) {
                                if(discountRate == 100) {
                                    discountAmount = 0;
                                }

                                var bonusItem = Object.assign({}, MyCart.getItemByID(promotionItem.itemId));
                                bonusItem.isPromotionItem = true;
                                bonusItem.promotionId = promotion.id;
                                bonusItem.promotionDetailId = detail.id;
                                bonusItem.isNewItem = true;
                                bonusItem.qty = bonusQty;
                                bonusItem.price = discountRate == 100 ? 0 : bonusItem.price;
                                bonusItem.discountAmount = discountAmount;
                                bonusItem.discountRate = discountRate/100;
                                bonusItem.qtyOfDiscountItems = bonusQty;
                                bonusItem.promotionTypeId = promotion.typeId;
                                bonusItem.total = ((bonusQty * bonusItem.price) - discountAmount);// * (1 + bonusItem.tax.rate);
                                delete bonusItem.uid;

                                promotionItemsOutput.push(bonusItem);
                            }
                        });


                    });

                    //console.error("promotionItemsOutput ", promotionItemsOutput);
                }
                if (promotion.typeId == PROMOTION_TYPES.DISCOUNT_SAME_ITEM) {
                    console.log("1");

                    promotionItems.forEach(function (promotionItem) {
                        var item = items[promotionItem.itemId];
                        var orderQty = item.qty;
                        var orderAmount = item.amount;
                        var bonusQty = 0;
                        var discountAmount = 0;

                        promotionDetails.forEach(function (detail) {
                            qtyIn = detail.qtyIn;
                            valueIn = detail.valueIn;
                            qtyOut = 0; //always set to zero since there are no bonus quantities
                            discountRate = detail.discountRate;
                            bonusQty = 0;
                            discountAmount = 0;

                            var factor = 0;

                            var qtyOfDiscountItems = 0;

                            if (qtyIn > 0 && orderQty >= qtyIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderQty / qtyIn);
                                } else {
                                    factor = 1;
                                }
                                qtyOfDiscountItems = factor * qtyIn;
                                orderQty = repeatable ? (orderQty - (qtyIn * factor)) : 0;
                                // bonusQty = factor * qtyOut;
                                discountAmount = item.price * (factor * qtyIn) * (discountRate / 100);
                              


                            }
                            else if (valueIn > 0 && orderAmount >= valueIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderAmount / valueIn);
                                } else {
                                    factor = 1;
                                }

                                var totalValue = (item.qty * item.price) * (1 + item.tax.rate);
                                qtyOfDiscountItems = Math.floor(totalValue / valueIn);

                                orderAmount = repeatable ? (orderAmount - (valueIn * factor)) : 0;
                                // bonusQty = factor * qtyOut;
                                discountAmount = (factor * valueIn) * (discountRate / 100);
                            }

                            if (discountAmount > 0) {
                                var bonusItem = Object.assign({}, MyCart.getItemByID(promotionItem.itemId));
                                bonusItem.isPromotionItem = true;
                                bonusItem.promotionId = promotion.id;
                                bonusItem.promotionDetailId = detail.id;
                                bonusItem.isNewItem = true;
                                //bonusItem.qty = bonusQty;
                                bonusItem.price = bonusItem.price*-1;
                                bonusItem.discountAmount = discountAmount;
                                bonusItem.discountRate = discountRate/100;
                                bonusItem.qtyOfDiscountItems = qtyOfDiscountItems;
                                bonusItem.promotionTypeId = promotion.typeId;
                                //bonusItem.total = ((((bonusItem.qty * bonusItem.price)*-1) - discountAmount) * (1 + bonusItem.tax.rate)) * -1;
                                bonusItem.total = discountAmount * -1;
                                bonusItem.excludeFromSubTotal = true;
                                delete bonusItem.uid;

                                console.log("bonusItem ",bonusItem)

                                promotionItemsOutput.push(bonusItem);
                            }
                        });


                    });

                    //console.error("promotionItemsOutput ", promotionItemsOutput);
                }
                if (promotion.typeId == PROMOTION_TYPES.INVOICE_DISCOUNT) {
                    console.log("1");

                    var discountAmount = 0;

                    promotionDetails.forEach(function (detail) {
                        qtyIn = 0;
                        valueIn = detail.valueIn;
                        qtyOut = 0; //always set to zero since there are no bonus quantities
                        discountRate = detail.discountRate;
                        bonusQty = 0;
                        discountAmount = 0;

                        var factor = 0;

                        var qtyOfDiscountItems = 0;

                        //TODO: Check with client whether to use invoiceTotal or invoiceSubTotal
                        if (valueIn > 0 && invoiceTotal >= valueIn) {
                            discountAmount = invoiceSubTotal * (discountRate / 100);
                        }

                        if (discountAmount > 0) {
                            var bonusItem = {
                                id: 0,
                                code: '0',
                                name: 'Invoice Discount',
                                aName: 'خصم فاتورة',
                                qty: 0,
                                price: 0,
                                taxId: 0,
                                taxRate: 0
                            }
                            bonusItem.isPromotionItem = true;
                            bonusItem.promotionId = promotion.id;
                            bonusItem.promotionDetailId = detail.id;
                            bonusItem.isNewItem = false;
                            bonusItem.discountAmount = discountAmount;
                            bonusItem.discountRate = discountRate/100;
                            bonusItem.qtyOfDiscountItems = 0;
                            bonusItem.promotionTypeId = promotion.typeId;
                            bonusItem.total = 0;

                            promotionItemsOutput.push(bonusItem);
                        }
                    });



                    //console.error("promotionItemsOutput ", promotionItemsOutput);
                }

                if (promotion.typeId == PROMOTION_TYPES.ITEM_PLUS_ANOTHER_ITEM) {
                    console.log("12222222");

                    promotionItems.forEach(function (promotionItem) {
                        var item = items[promotionItem.itemId];
                        var orderQty = item.qty;
                        var orderAmount = item.amount;
                        var bonusQty = 0;
                        var discountAmount = 0;

                        promotionDetails.forEach(function (detail) {
                            qtyIn = detail.qtyIn;
                            valueIn = detail.valueIn;
                            qtyOut = detail.qtyOut;
                            discountRate = detail.discountRate;
                            bonusQty = 0;
                            discountAmount = 0;

                            var factor = 0;

                            if (qtyIn > 0 && orderQty >= qtyIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderQty / qtyIn);
                                } else {
                                    factor = 1;
                                }

                                orderQty = repeatable ? (orderQty - (qtyIn * factor)) : 0;
                                bonusQty = factor * qtyOut;





                            }
                            else if (valueIn > 0 && orderAmount >= valueIn) {
                                if (repeatable) {
                                    factor = Math.floor(orderAmount / valueIn);
                                } else {
                                    factor = 1;
                                }

                                orderAmount = repeatable ? (orderAmount - (valueIn * factor)) : 0;
                                bonusQty = factor * qtyOut;

                            }

                            if (bonusQty > 0) {
                                promotionItemResults.forEach(function (promotionItemResult) {

                                    discountAmount = (bonusQty * promotionItemResult.item.price * promotionItemResult.factor) * (discountRate / 100);
                                    if(discountRate == 100) {
                                        discountAmount = 0;
                                    }
                                    var bonusItem = {
                                        id: promotionItemResult.itemId,
                                        code: promotionItemResult.item.code,
                                        name: promotionItemResult.item.name,
                                        aName: promotionItemResult.item.aName,
                                        price: promotionItemResult.item.price,
                                        taxId: promotionItemResult.item.taxId,
                                        taxRate: promotionItemResult.item.tax.rate,
                                        tax: promotionItemResult.item.tax,
                                    }
                                    bonusItem.isPromotionItem = true;
                                    bonusItem.promotionId = promotion.id;
                                    bonusItem.promotionDetailId = detail.id;
                                    bonusItem.isNewItem = true;
                                    bonusItem.qty = bonusQty * promotionItemResult.factor;
                                    bonusItem.price = discountRate == 100 ? 0 : bonusItem.price;
                                    bonusItem.discountAmount = discountAmount;
                                    bonusItem.discountRate = discountRate/100;
                                    bonusItem.qtyOfDiscountItems = bonusQty * promotionItemResult.factor;
                                    bonusItem.promotionTypeId = promotion.typeId;
                                    bonusItem.total = ((bonusQty * promotionItemResult.factor * bonusItem.price) - discountAmount);// * (1 + bonusItem.tax.rate);

                                    promotionItemsOutput.push(bonusItem);
                                });
                            }
                        });


                    });


                    //console.error("promotionItemsOutput ", promotionItemsOutput);

                }
            });
            callback ? callback(promotionItemsOutput) : false;
        }
        catch (ex) {
            //console.error(ex);
            errorCallback ? errorCallback(ex.message) : false;
        }
    }

};