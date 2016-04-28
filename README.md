# Report

## Criticism

These are criticisms of the original `test.js` provided.

- The whole body of this script should be wrapped in an [IIFE](iife) to isolate it from the global scope.
- Orders should probably be defined as a class that you can create instances of, instead of just defining them as loose object literals. If you're looking for a more OOP approach.
- You could even go as far as you abstract away the acquisition of the orders list into some kind of service factory, which for the moment could deliver the test data. This would make it easier to switch to acquiring the orders from an API at a later date.
- I'm not sure if this falls outside the scope of this test, but I personally would use some kind of MV* framework such as AngularJS or React to do this exercise. (However, I assume the purpose of this test is to test my knowledge of vanilla ES5 JavaScript and the DOM.)
- I would also write the application in modules, which I could then bundle using build tools such as [Webpack](webpack) or [Browserify][browserify].
- The view and model logic is all tightly coupled together.
- The `modal` for specifying the attributes the order is being created and appended to the DOM every time you click the _"Create order"_ button. Why not just create the form once and toggle the visibility when it is required. (Minimizing DOM reflows and repaints.)
- When you update the `color`, `size`, or `quantity` attributes the order's view updates. However, when you modify `customer` name the view does not update event when you click the _"Add order"_ button.

## Explanation

This is an explanation for the changes I made during the course of the test, the result of which can be found in `app.js`.

I split out the application into a few modules.

- **Model**
  * A model class, essentially an implementation of the *Observer* pattern, a way of wrapping data with accessors that have callbacks to notify an attached view.
- **OrderView**
  * An order view class, that when instantiated creates an element by cloning it's base template element `OrderViewTemplate`. It then binds itself to the model through the `onUpdate` callback. When it's model changes it triggers the bound `_onUpdated` method, which in turn updates the view.
- **ServiceLocator**
  * A basic implementation of the *Service Locator* pattern, used to decouple the `Orders` and `OrderForm`. Useful if these elements need to be switched out in future.
- **OrderForm**
  * Provides an instance of `OrderForm` which binds the value of form inputs in `test.html` to a new order `model` provided in the `createOrder` method. If the creation of the order is cancelled the model is deleted and the view updates accordingly.
- **Orders**
  * Provides order data from static data, but in the future could be swapped easily for an external resource acquired through AJAX.
- **App**
  * Initializes the application, get dependencies from *ServiceLocator*, and instantiates objects required. Then orchestrates the form, models, and views.  

[iife]:       https://en.wikipedia.org/wiki/Immediately-invoked_function_expression
[webpack]:    https://webpack.github.io/
[browserify]: http://browserify.org/
