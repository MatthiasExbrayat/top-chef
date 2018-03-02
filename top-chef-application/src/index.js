import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurants: this.props.restaurants
    }
  }

  //Add stars to the name of the restaurant
  title(restaurant) {
    var title = restaurant.name;
    for(var i=0; i<restaurant.michelinStars; i++){
      title += " *";
    }
    return title;
  }

  renderDeals(deals) {
    var dealsTab = [];
    deals.forEach(function(deal){
      dealsTab.push(React.createElement('p', null, deal.title))
    });
    return dealsTab;
  }

  renderCard(restaurant) {
    return (
      <div class="mdl-card mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-shadow--8dp" id={restaurant.LaFourchetteID}>
        <figure class="mdl-card__media">
          <img src={restaurant.URL_image} alt=""/>
        </figure>
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">{this.title(restaurant)}</h2>
        </div>
        <div class="mdl-card__supporting-text bold">
          {restaurant.address.street}<br/>
          {restaurant.address.postalCode} {restaurant.address.city.charAt(0).toUpperCase() + restaurant.address.city.slice(1).toLowerCase().replace(/\d/g,'')}
        </div>
        <div class="mdl-card__supporting-text">
          {this.renderDeals(restaurant.deals)}
        </div>
        <div class="mdl-card__actions mdl-card--border">
          <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" target="_blank" href={restaurant.URL_LaFourchette}>Go on La Fourchette</a>
          <div class="mdl-layout-spacer"></div>
          <button class="mdl-button mdl-button--icon mdl-button--colored"><i class="material-icons">favorite</i></button>
          <button class="mdl-button mdl-button--icon mdl-button--colored"><i class="material-icons">share</i></button>
        </div>
      </div>
    );
  }

  render() {
    var tab = [];
    var parentThis = this;
    this.state.restaurants.forEach(function(restaurant){
      tab.push(parentThis.renderCard(restaurant));
    });

    return (
      <div>
        <div class="col-lg-12 text-center">
          <h5>{this.state.restaurants.length} deals found on La Fourchette :</h5>
        </div>
        <div class="mdl-grid">
          {tab}
        </div>
      </div>
    );
  }
}


function getRestaurantsWithDeals(restaurants){
  var restaurants_with_deals = [];
  for(var i in restaurants){
    // get only the restaurants with deals
    if ('deals' in restaurants[i] && restaurants[i].deals.length > 0){
      var deals_with_special_offer = [];
      for(var j in restaurants[i].deals){
        if (restaurants[i].deals[j].isSpecialOffer === true){
          deals_with_special_offer.push(restaurants[i].deals[j]);
        }
      }
      if(deals_with_special_offer.length > 0) {
        restaurants[i].deals = deals_with_special_offer;
        restaurants_with_deals.push(restaurants[i]);
      }
    }
  }
  return restaurants_with_deals;
}

// get all restaurants
fetch('src/restaurants_list_with_LaFourchetteDeals.json')
  .then(function(restaurants){
    restaurants = restaurants.json();
    return restaurants;
  })
  .then(function(restaurants){
    var restaurants_with_deals = getRestaurantsWithDeals(restaurants);

    ReactDOM.render(
      <Grid restaurants={restaurants_with_deals}/>,
      document.getElementById('grid-cards')
    )
})
