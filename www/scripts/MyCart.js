var MyCart = (function (_this) {

    /**
     * Each cart item should have the following fields
     * ID,
     * Name,
     * Price,
     * Qty,
     * Image
     */

    var cartItems = {};

    function notifyChanges(item) {
        if (window["DelegateManager"]) {
            DelegateManager.triggerEvent("cart::updated", item);
        }
    }

    function parseItem(item) {
        var model = {
            id: item["id"] || 0,
            name: item["name"] || "",
            qty: item["qty"] || 0,
            price: item["price"] || 0,
            image: item["image"] || 0
        };

        return Object.assign(item, model);
    }

    _this.itemExists = function (item) {
        var cItem = null;

        try {
            cItem = cartItems[item.id];
        } catch (ex) { }

        return cItem != null && cItem != undefined;
    }

    _this.getItemByID = function (itemID) {
        var cItem = cartItems[itemID];
        return cItem;
    }

    _this.getCartItems = function () {
        var items = Object.keys(cartItems).map(function (item) {
            return cartItems[item];
        });

        return items;
    }

    _this.addItem = function (item) {
        item = parseItem(item);

        if (_this.itemExists(item)) {
            cartItems[item.id].qty++;
        }
        else {
            item.qty = item.qty == 0 ? 1 : item.qty;
            cartItems[item.id] = item;
        }

        notifyChanges(item);
        return item.qty;
    }

    _this.removeItem = function (item) {
        item = parseItem(item);

        item.qty = 0;

        delete cartItems[item.id];
        notifyChanges(item);
        return 0;
    }

    _this.increaseQty = function (item, addIfZero) {
        item = parseItem(item);

        if (!_this.itemExists(item)) {
            if (!addIfZero) {
                return 0;
            }
            else {
                _this.addItem(item);
                return cartItems[item.id].qty;
            }
        }

        cartItems[item.id].qty = cartItems[item.id].qty + 1;

        notifyChanges(item);

        return cartItems[item.id].qty;
    }

    _this.decreaseQty = function (item, removeIfZero) {
        item = parseItem(item);

        if (!_this.itemExists(item)) {
            return 0;
        }

        if (cartItems[item.id].qty > 1) {
            cartItems[item.id].qty = cartItems[item.id].qty - 1;
        }
        else {
            if (removeIfZero) {
                _this.removeItem(item);
                return 0;
            }
        }

        notifyChanges(item);

        return cartItems[item.id].qty;
    }

    _this.updateQty = function (item, qty) {
        item = parseItem(item);

        qty = qty < 0 ? 0 : qty;

        if (!this.itemExists(item) && qty > 0) {
            item.qty = qty;
            return _this.addItem(item);
        }
        else {
            if (qty == 0) {
                _this.removeItem(item);
                return 0;
            }
            else {
                item.qty = qty;
                cartItems[item.id].qty = qty;

                notifyChanges(item);

                return cartItems[item.id].qty;
            }
        }
    }

    _this.clearCart = function () {
        cartItems = {};
        notifyChanges();
    }

    _this.getNoOfItems = function () {
        return cartItems ? Object.keys(cartItems).length : 0;
    }

    _this.getSummary = function () {
        var items = _this.getCartItems();

        var subTotal = 0;
        var discount = 0;
        var tax = 0;
        var total = 0;
        var delivery = parseFloatNumber(getSystemParameter("DeliveryRate", 0));
        if (cachedUser.hasOwnProperty("deliveryRate")){
            delivery=cachedUser.DeliveryRate;
        }

        items.forEach(function (item) {
            var itemSubTotal = parseFloatNumber(item.qty * item.price);
            var itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
            var itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
            var itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);

            subTotal = parseFloatNumber(subTotal) + itemSubTotal;
            discount = parseFloatNumber(discount) + itemDiscount;
            tax = parseFloatNumber(tax) + itemTax;
            total = parseFloatNumber(total) + itemTotal;
        });

        return {
            subtotal: subTotal,
            discount: discount,
            tax: tax,
            delivery: delivery,
            total: total + delivery
        };
    }

    return _this;

})({});