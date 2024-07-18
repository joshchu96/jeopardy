let categories = [];
const NUM_QUESTIONS_PER_CAT = 5; // Define the number of questions per category

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  try {
    let response = await $.get(
      "https://rithm-jeopardy.herokuapp.com/api/categories?count=100"
    );
    let categoryIds = response.map((category) => category.id);
    return categoryIds;
  } catch (error) {
    console.error("Error fetching category ids:", error);
  }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  try {
    let response = await $.get(
      `https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`
    );
    let category = {
      title: response.title,
      clues: response.clues.map((clue) => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
      })),
    };
    return category;
  } catch (error) {
    console.error(`Error fetching category ${catId}:`, error);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  try {
    let categoryIds = await getCategoryIds();
    categories = [];

    // Fetch data for each category
    for (let catId of categoryIds) {
      let category = await getCategory(catId);
      categories.push(category);
    }

    // Populate the HTML table dynamically
    let table = $("#jeopardy");
    let thead = $("<thead>");
    let headerRow = $("<tr>");
    categories.forEach((category) => {
      headerRow.append(`<th>${category.title}</th>`);
    });
    thead.append(headerRow);
    table.append(thead);

    let tbody = $("<tbody>");
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
      let row = $("<tr>");
      categories.forEach((category) => {
        row.append(
          `<td class="question" data-cat="${category.title}" data-clue="${i}">?</td>`
        );
      });
      tbody.append(row);
    }
    table.append(tbody);

    // Add click event handler for questions
    $("table").on("click", ".question", handleClick);
  } catch (error) {
    console.error("Error filling table:", error);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  let cell = $(evt.target);
  let cat = cell.data("cat");
  let clueIdx = cell.data("clue");
  let clue = categories.find((category) => category.title === cat).clues[
    clueIdx
  ];

  if (!clue.showing) {
    cell.text(clue.question);
    clue.showing = "question";
  } else if (clue.showing === "question") {
    cell.text(clue.answer);
    clue.showing = "answer";
  }
}

/** Show the loading view (e.g., a spinner or loading text). */
function showLoadingView() {
  $("#jeopardy").html(
    '<tr><td colspan="6" class="loading">Loading...</td></tr>'
  );
}

/** Hide the loading view (e.g., remove the spinner or loading text). */
function hideLoadingView() {
  $("#jeopardy").find(".loading").remove(); // Remove the loading text
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  try {
    showLoadingView();
    await fillTable();
    hideLoadingView();
  } catch (error) {
    console.error("Error setting up and starting game:", error);
  }
}

/** On click of restart button, set up game. */
$("#restart").click(function () {
  setupAndStart();
});

/** On page load, add event handler for clicking clues and start the game. */
$(document).ready(function () {
  setupAndStart();
});
