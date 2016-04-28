window.addEventListener('load',function(){
	var lightBox = document.body.appendChild(document.createElement('div'));
	lightBox.classList.add('lightbox');
	var orderList = document.querySelector('div.orders');
	var values = {
		color : ['white','red','green'],
		size : ['small','medium','large']
	}
	var orders = [
		{
			color : 'white',
			size : 'large',
			quantity : 1,
			customer : "evans"
		},
		{
			color : 'red',
			size : 'small',
			quantity : 12,
			customer : "clark"
		}
	];
	var addToOrders = function(order){
		var sameName = orders.filter(function(item){
			return (item.customer === order.customer);
		});
		if(sameName.length>0){
			alert("Choose a different name");
			return false;
		}else{
			orders.push(order);
			return true;
		}

	}
	var createOrderDisplay = function(order){
		var container = document.createElement('div');
		container.classList.add('order-'+order.customer);
		var list = container.appendChild(document.createElement('ul'));
		for(var field in order){
			var li = list.appendChild(document.createElement('li'));
			li.textContent = field +": " + order[field];
			li.classList.add(field);
		}
		return container;
	}
	for(var i=0; i<orders.length; i++){
		orderList.appendChild(createOrderDisplay(orders[i]));
	}
	var displayOrder = function(_order,fields){
		var order = _order;
		var orderContainer = createOrderDisplay(order);
		orderList.appendChild(orderContainer);
		var updateField = function(evt){
			var list = orderContainer.querySelector('ul');
			for(var field in order){
				var li = list.querySelector("li."+field);
				if(li){
					li.textContent = field +": " + order[field]
				}else{
					li = list.appendChild(document.createElement('li'));
					li.classList.add(field);
					li.textContent = field +": " + order[field]
				}
			}
		}
		for(var field in fields){
			fields[field].addEventListener('change',updateField);
		}
	}
	document.querySelector('button.new-order').addEventListener('click',function(){
		lightBox.style.display = "block";
		var modal = lightBox.appendChild(document.createElement('div'));
		modal.classList.add('modal');
		var customer = modal.appendChild(document.createElement('input'));
		customer.type = "text";
		var order = {customer : '',color : '',size : '',quantity:0};
		var fields = {};
		var customerButton = modal.appendChild(document.createElement('button'));
		customerButton.textContent = "Add order";
		customerButton.addEventListener('click',function(evt){
			order.customer = customer.value;
			if(addToOrders(order)){
				modal.removeChild(customerButton);
				var color = modal.appendChild(document.createElement('select'));
				values.color.forEach(function(value){
					var option = color.appendChild(document.createElement('option'));
					option.value = value;
					option.textContent = value;
					color.addEventListener('change',function(evt){
						if(this.value === option.value){
							order.color = option.value;
						}
					})
				});
				fields.color = color;
				var size = modal.appendChild(document.createElement('select'));
				values.size.forEach(function(value){
					var option = size.appendChild(document.createElement('option'));
					option.value = value;
					option.textContent = value;
					size.addEventListener('change',function(evt){
						if(this.value === option.value){
							order.size = option.value;
						}
					})
				});
				fields.size = size;
				var quantity = modal.appendChild(document.createElement('input'));
				quantity.type = "range";
				var updateQuantity = function(evt){
					order.quantity = this.value;
				}
				quantity.addEventListener('input',updateQuantity);
				quantity.addEventListener('change',updateQuantity);
				fields.quantity = quantity;
				displayOrder(order , fields);
				var finished = modal.appendChild(document.createElement('button'));
				finished.innerText = "Completed";
				finished.addEventListener('click', function(){modal.parentNode.removeChild(modal)});
			}
		})
	});



})
