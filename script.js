// global variables
const apiKey = "1"; //cocktailDB "always-free" developer API key
const form = document.querySelector("form");
const input = document.getElementById("ingredients");
const cocktailList = document.getElementById("results");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent auto submit

  cocktailList.innerHTML = "";

  // extract values of each included ingredient from the dropdown list
  let ingredients = "";
  for (let i = 0; i < input.options.length; i++) {
    if (input.options[i].selected) {
      ingredients += input.options[i].value + ",";
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
  // removes trailing comma
  ingredients = ingredients.slice(0, -1);

  // test that this worked correctly
  console.log(`ingredients list: ${ingredients}`);

  // from docs https://www.thecocktaildb.com/api.php
  const apiUrl = `https://www.thecocktaildb.com/api/json/v1/${apiKey}/filter.php?i=${ingredients}`;

  const xhttp = new XMLHttpRequest();
  // instead of packaging up the x-api it's included in the apiUrl above (as are the ingredients) since we're querying a database
  xhttp.open("GET", apiUrl);
  xhttp.onload = function () {
    if (xhttp.status === 200) {
      // response text is list of dictionaries
      // {strDrink, strDrinkThumb, idDrink}

      const data = JSON.parse(xhttp.responseText);

      // for each drink from the JSON response
      data.drinks.forEach((cocktail) => {
        const cocktailItem = document.createElement("div");
        cocktailItem.className = "result";
        const cocktailHeader = document.createElement("h2");
        cocktailHeader.textContent = cocktail.strDrink;
        cocktailHeader.addEventListener("click", (e) => {
          e.preventDefault();
          showModal(cocktail);
        });
        cocktailItem.appendChild(cocktailHeader);
        const cocktailImage = document.createElement("img");
        cocktailImage.src = `${cocktail.strDrinkThumb}/preview`;
        cocktailItem.appendChild(cocktailImage);
        cocktailList.appendChild(cocktailItem);
      });
    } else {
      console.log("Error! Wasn't able to get the data");
    }
  };
  xhttp.send();
});

// When an item is clicked, display ingredient and step modal

function showModal(cocktail) {
  // make api call with idDrink
  console.log(cocktail.idDrink);
  // www.thecocktaildb.com/api/json/v1/1/lookup.php?i=12345 example from docs
  const apiUrl = `https://www.thecocktaildb.com/api/json/v1/${apiKey}/lookup.php?i=${cocktail.idDrink}`;

  const xhttp = new XMLHttpRequest();

  xhttp.open("GET", apiUrl);
  xhttp.onload = function () {
    if (xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);

      // add overlay to the page
      const overlay = document.createElement("div");
      overlay.id = "overlay";
      document.body.appendChild(overlay);

      // display the overlay and disable scrolling
      overlay.style.display = "block";
      document.body.style.overflow = "hidden";

      const modal = document.getElementById("modal");
      // clear the modal to start
      modal.innerHTML = "";

      // content container
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      // close button
      const modalClose = document.createElement("span");
      modalClose.className = "close";
      modalClose.innerHTML = "&times;";

      modalClose.addEventListener("click", () => {
        // hide the modal
        modal.style.display = "none";
        // hide the overlay
        overlay.style.display = "none";
        // re-enable scrolling
        document.body.style.overflow = "auto";
      });
      const cocktailName = document.createElement("h2");
      cocktailName.textContent = cocktail.strDrink;
      const cocktailImage = document.createElement("img");
      cocktailImage.src = `${cocktail.strDrinkThumb}/preview`;
      const cocktailDetails = document.createElement("p");

      // put instructions into an array so it looks prettier
      const cocktailInstructions = data.drinks[0].strInstructions;
      const instructionsArray = cocktailInstructions.split(".");
      const cocktailInstructionsList = document.createElement("ol");

      // separate instructions into numbered list
      for (let i = 0; i < instructionsArray.length; i++) {
        if (instructionsArray[i] !== "") {
          const instructionItem = document.createElement("li");
          instructionItem.textContent = `${instructionsArray[i]}`;
          cocktailInstructionsList.appendChild(instructionItem);
        }
      }

      cocktailDetails.innerHTML = `
    <strong>Instructions:</strong> ${cocktailInstructionsList.outerHTML}
    <strong>Ingredients:</strong>
  `;

      for (let i = 1; i <= 15; i++) {
        const ingredientName = data.drinks[0][`strIngredient${i}`];
        const ingredientMeasure = data.drinks[0][`strMeasure${i}`];
        if (ingredientName) {
          const ingredientItem = document.createElement("div");
          if (ingredientMeasure) {
            ingredientItem.textContent = `${ingredientName}: ${ingredientMeasure}`;
          }
          if (!ingredientMeasure) {
            ingredientItem.textContent = `${ingredientName}: as needed`;
          }
          cocktailDetails.appendChild(ingredientItem);
        } else {
          break;
        }
      }

      // TEMP add to favorites button
      const addToFavoritesBtn = document.createElement("button");
      addToFavoritesBtn.textContent = "Add to favorites";
      addToFavoritesBtn.className = "add-to-favorites";
      addToFavoritesBtn.addEventListener("click", () => {
        addToList(cocktail);
        // hide the modal
        modal.style.display = "none";
        // hide the overlay
        overlay.style.display = "none";
        // re-enable scrolling
        document.body.style.overflow = "auto";
      });

      modalContent.appendChild(modalClose);
      modalContent.appendChild(cocktailName);
      modalContent.appendChild(cocktailImage);
      modalContent.appendChild(cocktailDetails);
      modalContent.appendChild(addToFavoritesBtn);
      modal.appendChild(modalContent);
      modal.style.display = "block";
    } else {
      alert("Error! Wasn't able to get more info from db");
    }
  };
  xhttp.send();
}

/* 

repurposing the ToDo App API so user can add fav cocktails to a list

*/
function addToList(cocktail) {
  if (cocktail) {
    // Setting variable for form input (get from HTML form)
    let data = {
      text: cocktail.idDrink,
    };

    // Initalize AJAX Request
    let xhttp = new XMLHttpRequest();

    // Response handler
    xhttp.onreadystatechange = function () {
      // Wait for readyState = 4 & 200 response
      if (this.readyState == 4 && this.status == 200) {
        // alert to show it was successful, not just a console log
        alert("added to favorites!");

        getToDos();

        // parse JSON response
        let todo = JSON.parse(this.responseText);

        // probably no repsonse, but keeping for vibes
        console.log(todo);
      } else if (this.readyState == 4) {
        // this.status !== 200, there is an error from server
        console.log(this.responseText);
      }
    };

    xhttp.open("POST", "https://cse204.work/todos", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    // generated a new api key
    xhttp.setRequestHeader("x-api-key", "eeb927-b5c15b-83f4f5-0847af-9d3b44");
    xhttp.send(JSON.stringify(data));
  } else {
    alert("need to add a todo!");
  }
}

// deleting a toDo item
function removeFromList(id) {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert(`removed from favorites!`);
      getToDos();
    }
  };

  xhttp.open("DELETE", `https://cse204.work/todos/${id}`, true);
  xhttp.setRequestHeader("x-api-key", "eeb927-b5c15b-83f4f5-0847af-9d3b44");
  xhttp.send();
}

let favsList = document.getElementById("favorites-list");

// getting the "id" todos and rendering (getDrink in favs list is nested)
function getToDos() {
  // clear favs list
  favsList.innerHTML = "";
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let todos = JSON.parse(this.responseText);
      if (todos.length == 0) {
        favsList.innerHTML =
          "<p>No favorites. Go ahead and search for some new concoctions!</p>";
      }
      for (let i = 0; i < todos.length; i++) {
        let todo = todos[i];
        if (todo.text) {
          getDrink(todo);
        }
      }
    } else if (this.readyState == 4) {
      console.log(this.responseText);
    }
  };

  xhttp.open("GET", "https://cse204.work/todos", true);
  xhttp.setRequestHeader("x-api-key", "eeb927-b5c15b-83f4f5-0847af-9d3b44");
  xhttp.send();
}

function getDrink(todo) {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      if (data.drinks && data.drinks.length > 0) {
        const cocktail = data.drinks[0];
        const cocktailItem = document.createElement("div");
        cocktailItem.className = "favorite";
        const cocktailHeader = document.createElement("h4");
        cocktailHeader.textContent = cocktail.strDrink;
        cocktailHeader.addEventListener("click", (e) => {
          e.preventDefault();
          showModalFavorites(cocktail);
        });
        cocktailItem.appendChild(cocktailHeader);
        const cocktailImage = document.createElement("img");
        cocktailImage.src = `${cocktail.strDrinkThumb}/preview`;
        cocktailItem.appendChild(cocktailImage);

        // TEMP remove from favorites button
        const removeFromFavoritesBtn = document.createElement("button");
        removeFromFavoritesBtn.textContent = "Remove";
        removeFromFavoritesBtn.className = "remove-from-favorites";
        removeFromFavoritesBtn.addEventListener("click", (e) => {
          e.preventDefault();
          removeFromList(todo.id);
        });
        cocktailItem.appendChild(removeFromFavoritesBtn);

        favsList.appendChild(cocktailItem);
      }
    } else if (this.readyState == 4) {
      console.log(this.responseText);
    }
  };

  xhttp.open(
    "GET",
    `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${todo.text}`,
    true
  );
  xhttp.send();
}

// on page load, refresh the display to show all todo elements
document.addEventListener("DOMContentLoaded", () => {
  getToDos();
});

function showModalFavorites(cocktail) {
  // make api call with idDrink
  console.log(cocktail.idDrink);
  // www.thecocktaildb.com/api/json/v1/1/lookup.php?i=12345 example from docs
  const apiUrl = `https://www.thecocktaildb.com/api/json/v1/${apiKey}/lookup.php?i=${cocktail.idDrink}`;

  const xhttp = new XMLHttpRequest();

  xhttp.open("GET", apiUrl);
  xhttp.onload = function () {
    if (xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);

      // add overlay to the page
      const overlay = document.createElement("div");
      overlay.id = "overlay";
      document.body.appendChild(overlay);

      // display the overlay and disable scrolling
      overlay.style.display = "block";
      document.body.style.overflow = "hidden";

      const modal = document.getElementById("modal");
      // clear the modal to start
      modal.innerHTML = "";

      // content container
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      // close button
      const modalClose = document.createElement("span");
      modalClose.className = "close";
      modalClose.innerHTML = "&times;";

      modalClose.addEventListener("click", () => {
        // hide the modal
        modal.style.display = "none";
        // hide the overlay
        overlay.style.display = "none";
        // re-enable scrolling
        document.body.style.overflow = "auto";
      });
      const cocktailName = document.createElement("h2");
      cocktailName.textContent = cocktail.strDrink;
      const cocktailImage = document.createElement("img");
      cocktailImage.src = `${cocktail.strDrinkThumb}/preview`;
      const cocktailDetails = document.createElement("p");

      // put instructions into an array so it looks prettier
      const cocktailInstructions = data.drinks[0].strInstructions;
      const instructionsArray = cocktailInstructions.split(".");
      const cocktailInstructionsList = document.createElement("ol");

      // separate instructions into numbered list
      for (let i = 0; i < instructionsArray.length; i++) {
        if (instructionsArray[i] !== "") {
          const instructionItem = document.createElement("li");
          instructionItem.textContent = `${instructionsArray[i]}`;
          cocktailInstructionsList.appendChild(instructionItem);
        }
      }

      cocktailDetails.innerHTML = `
    <strong>Instructions:</strong> ${cocktailInstructionsList.outerHTML}
    <strong>Ingredients:</strong>
  `;

      for (let i = 1; i <= 15; i++) {
        const ingredientName = data.drinks[0][`strIngredient${i}`];
        const ingredientMeasure = data.drinks[0][`strMeasure${i}`];
        if (ingredientName) {
          const ingredientItem = document.createElement("div");
          if (ingredientMeasure) {
            ingredientItem.textContent = `${ingredientName}: ${ingredientMeasure}`;
          }
          if (!ingredientMeasure) {
            ingredientItem.textContent = `${ingredientName}: as needed`;
          }
          cocktailDetails.appendChild(ingredientItem);
        } else {
          break;
        }
      }

      modalContent.appendChild(modalClose);
      modalContent.appendChild(cocktailName);
      modalContent.appendChild(cocktailImage);
      modalContent.appendChild(cocktailDetails);
      modal.appendChild(modalContent);
      modal.style.display = "block";
    } else {
      alert("Error! Wasn't able to get more info from db");
    }
  };
  xhttp.send();
}
