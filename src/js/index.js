import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
/*Global State
-Search object
-Current recipe object
-Shopping list object
-Liked recipes
*/
const state = {}

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
        recipeView.renderRecipe(state.recipe);
        } catch (error) {
            alert('You have starve')
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlReccipe));