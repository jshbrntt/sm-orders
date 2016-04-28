// Creating namespace on the global scope (SM => Speechmatics)
window.SM = {};

/**
 * Module: Model
 */
(function(SM) {
  'use strict';
  var Model = function(data) {
    this.data     = data;
    this.onUpdate = null;
    this.onDelete = null;
  };
  // Static method.
  Model._propertyError = function(key) {
    throw new Error("Property '" + key + "' does not exist.");
  }
  Model.prototype._updated = function(key) {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(key, this.data[key]);
    }
  };
  Model.prototype.set = function(key, value) {
    if (key in this.data) {
      // Only bother updating if the new value is different from the current one.
      if (this.data[key] !== value) {
        this.data[key] = value;
        this._updated(key, this.data[key]);
      }
    } else {
      Model._propertyError(key);
    }
  };
  Model.prototype.get = function(key) {
    if (key in this.data) {
      return this.data[key];
    } else {
      Model._propertyError(key);
    }
  };
  Model.prototype.delete = function () {
    this.data = null;
    if (typeof this.onDelete === 'function') {
      this.onDelete();
    }
  };
  // Exporting class under namespace.
  SM.Model = Model;
}(window.SM));

/**
 * Module: OrderView
 */
(function(SM, document) {
  'use strict';
  var visibleProperties = [
    'color',
    'customer',
    'quantity',
    'size'
  ];
  var list = document.createElement('ul');
  for (var i in visibleProperties) {
    var prop = visibleProperties[i];
    var listItem = document.createElement('li');
    listItem.className = prop;
    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = prop + ': ';
    listItem.appendChild(label);
    var value = document.createElement('span');
    value.className = "value";
    listItem.appendChild(value);
    list.appendChild(listItem);
  }
  var OrderViewTemplate = document.createElement('div');
  OrderViewTemplate.appendChild(list);

  var OrderView = function(model) {
    this._model          = model;
    this._model.onUpdate = this._onUpdated.bind(this);
    this.element         = OrderViewTemplate.cloneNode(true);
    // Initilizing view.
    for (var property in this._model.data) {
      this._onUpdated(property, this._model.data[property]);
    }
  }
  OrderView.prototype._onUpdated = function(key, value) {
    var element = this.element.querySelector('li.' + key).querySelector('span.value');
    if (element) {
      element.textContent = value;
    }
  };
  SM.OrderView = OrderView;
}(window.SM, document));

/**
 * Module: ServiceLocator
 */
(function(SM) {
  'use strict';
  var ServiceLocator = {};
  ServiceLocator.provide = function(name, instance) {
    if (!ServiceLocator._services) {
      ServiceLocator._services = {};
    }
    ServiceLocator._services[name] = instance;
  };
  ServiceLocator.get = function(name) {
    if (ServiceLocator._services.hasOwnProperty(name)) {
      return ServiceLocator._services[name];
    } else {
      throw Error('Service "' + name + '" is unavailable.');
    }
  };
  SM.ServiceLocator = ServiceLocator;
}(window.SM));

/**
 * Module: OrderForm
 */
(function(ServiceLocator, window) {
  'use strict';
  var OrderForm = function() {
    this.element       = document.querySelector('div.lightbox');
    this.onSave        = null;
    this.onCancel      = null;

    this.customerInput = this.element.querySelector('input[name=customer]');
    this.colorSelect   = this.element.querySelector('select[name=color]');
    this.sizeSelect    = this.element.querySelector('select[name=size]');
    this.quantityInput = this.element.querySelector('input[name=quantity]');
    this.saveBtn       = this.element.querySelector('button[name=save]');
    this.cancelBtn     = this.element.querySelector('button[name=cancel]');

    this.saveBtn.addEventListener('click'       , this._onButtonClicked.bind(this));
    this.cancelBtn.addEventListener('click'     , this._onButtonClicked.bind(this));

    this.customerInput.addEventListener('change', this._onInputChanged.bind(this));
    this.colorSelect.addEventListener('change'  , this._onInputChanged.bind(this));
    this.sizeSelect.addEventListener('change'   , this._onInputChanged.bind(this));
    this.quantityInput.addEventListener('change', this._onInputChanged.bind(this));
  };
  OrderForm.prototype.show = function () {
    this.element.style.display = 'block';
  };
  OrderForm.prototype.hide = function () {
    this.element.style.display = 'none';
  };
  OrderForm.prototype.createOrder = function(model) {
    this._model              = model;
    this.customerInput.value = this._model.get('customer');
    this.colorSelect.value   = this._model.get('color');
    this.sizeSelect.value    = this._model.get('size');
    this.quantityInput.value = this._model.get('quantity');
    this.show();
  };
  OrderForm.prototype._onButtonClicked = function(event) {
    switch (event.target.name) {
      case 'cancel':
        if (this._model) {
          this._model.delete();
        }
      default:
        this._model = null;
        this.hide();
        break;
    }
  };
  OrderForm.prototype._onInputChanged = function(event) {
    if (this._model) {
      this._model.set(event.target.name, event.target.value);
    }
  };
  window.addEventListener('load', function() {
    ServiceLocator.provide('OrderForm', (function() {
      return new OrderForm();
    })());
  });
}(window.SM.ServiceLocator, window));

/**
 * Module: Orders
 */
(function(ServiceLocator) {
  'use strict';
  ServiceLocator.provide('Orders', (function() {
    return {
      retrieve: function() {
        return [{
          color: 'white',
          size: 'large',
          quantity: 1,
          customer: "evans"
        }, {
          color: 'red',
          size: 'small',
          quantity: 12,
          customer: "clark"
        }]
      }
    };
  })());
}(window.SM.ServiceLocator));


/**
 * Module: App
 */
(function(SM, document) {
  'use strict';
  var orderForm;
  var orders;
  var ordersDiv;
  var createOrderBtn;
  var orderModels = [];

  function getOrderModels() {
    var orderModels = [];
    var data = ordersService.retrieve();
    for (var i in data) {
      orderModels.push(
        new SM.Model(data[i])
      );
    }
    return orderModels;
  }

  function onCreateOrderClicked(event) {
    var orderModel = new SM.Model({
      color: null,
      customer: null,
      quantity: null,
      size: null
    });
    createOrderView(orderModel);
    orderForm.createOrder(orderModel);
  }

  function createOrderView(model) {
    var view = new SM.OrderView(model);
    ordersDiv.appendChild(view.element);
    model.onDelete = (function() {
      ordersDiv.removeChild(view.element);
    }).bind(this);
  }

  function initialize() {
    // Getting services.
    orderForm = SM.ServiceLocator.get('OrderForm');
    orders = SM.ServiceLocator.get('Orders');

    // Storing references to application DOM elements.
    ordersDiv = document.querySelector('div.orders');
    createOrderBtn = document.querySelector('button[name=create-order]');

    // Attaching event listeners.
    createOrderBtn.addEventListener('click', onCreateOrderClicked.bind(this));

    // Initializing models and attaching views.
    orderModels = getOrderModels();
    for (var i in orderModels) {
      createOrderView(orderModels[i]);
    }
  }
  window.addEventListener('load', initialize);
}(window.SM, document));
