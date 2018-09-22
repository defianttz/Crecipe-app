import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
/*Global State
-Search object
-Current recipe object
-Shopping list object
-Liked recipes
*/
const state = {};
window.state = state; //test

//SEARCH controller
const controlSearch = async () => {
    //Get Query from view
    const query = searchView.getInput();

    if(query) {
        //New search object and add to state
        state.search = new Search(query);

        //Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
        //Search for recipes
        await state.search.getResults();

        //render results to UI
        clearLoader();
        searchView.renderResults(state.search.result);   
        } catch (error) {
            alert('Error! You have to build your own recipe');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); 
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const gotoPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, gotoPage);
    }
})

//RECIPE controller

const controlReccipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if(state.search) searchView.highlightSelected(id);
        //Create new Recipe object
        state.recipe = new Recipe(id);

        try {
        //Get recipe data and parse ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        
        //calculate time and servings
        state.recipe.calcTime();
        state.recipe.calcServings();

        //Render recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );

        } catch (error) {
            alert('You have starve')
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlReccipe));

//LIST Controller

const controlList = () => {
    //Create a new list IF there is none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        
        //delete from state
        state.list.deleteItem(id);
        
        //delete from UI
        listView.deleteItem(id);

        //handle count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updaCount(id, val);
    }

});

//LIKES controller
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //Recipe NOT liked yet
    if(!state.likes.isLiked(currentID)) {
        //Add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe,img
        );
        //Toggle like button
        likesView.toggleLikeBtn(true);

        //Add Like to UI List
        likesView.renderLike(newLike);
        
        //User Like some Recipe
    } else {
        //Remove Like from State
        state.likes.deleteLike(currentID);
        
        //Toggle like Button
        likesView.toggleLikeBtn(false);

        //Remove from UI List
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

window.addEventListener('load', () => {
    state.likes = new Likes();
    
    //Restore, toggle and render existing likes
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => like.likesView.renderLike(like));
});

//Handling Recipe Button clicks
elements.recipe.addEventListener('click', event => {
    if(event.target.matches('.btn-decrease, .btn-decrease *')) {

        if(state.recipe.serving)
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);

    } else if(event.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to Shopping List
        controlList();
    } else if (event.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});

