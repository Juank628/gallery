import './style.css';
import './index.html';
import filledHeartIcon from './img/filled_heart_icon.png';
import TvmazeConnection from './modules/TvmazeConnection.js';
import Render from './modules/Render.js';
import InvolvementAPI from './modules/InvolvmentAPI.js';
import CardsCounter from './modules/CardsCounter.js';

const listElement = document.getElementById('items-list');
const itemsContainer = document.querySelector('.items-container');
const tvMazeConnection = new TvmazeConnection();
const involvementConnection = new InvolvementAPI();
const render = new Render(listElement);
const cardsCounter = new CardsCounter();

window.addEventListener('load', async () => {
  const itemsToRender = await tvMazeConnection.getMoviesByTopic('planet');
  const likes = await involvementConnection.getLikes();
  render.show(itemsToRender, likes);
  const cardsCount = cardsCounter.getCount(document);
  document.querySelector('.movies').textContent = `(${cardsCount})`;

  const commentButtons = document.querySelectorAll('.card-button');
  commentButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const popUp = document.createElement('article');
      popUp.classList.add('pop-up-container');
      const movieData = await tvMazeConnection.getSingleMovie(
        button.parentElement.parentElement.id,
      );
      const comments = await involvementConnection.getComments(
        button.parentElement.parentElement.id,
      );
      const commentSection = document.createElement('div');
      if (comments.length > 0) {
        commentSection.classList.add('list-comments');
        commentSection.innerHTML = `
        <h3 class="comment-title">Comments(${comments.length})</h3>`;
        comments.forEach((comment) => {
          const com = document.createElement('p');
          com.classList.add('comment');
          com.innerHTML = `<span class="comment-user">${comment.username}</span><span class="comment-date">${comment.creation_date}</span>
          <span class="comment-text">${comment.comment}</span>`;
          commentSection.appendChild(com);
        });
      } else {
        commentSection.classList.add('list-comments');
        commentSection.innerHTML = `
        <h3 class="comment-title">Comments(0)</h3>`;
      }
      popUp.innerHTML = `
      <section class="info-container scroll">
            <img class="cross" src="https://cdn-icons-png.flaticon.com/512/1828/1828774.png" alt="">
            <img class="movie-preview" src="${movieData.image.original}" alt="">
            <h2 class="movie-name">${movieData.name}</h2>
            <ul class="list-ingredients">
                <li class="ingredient">Language: ${movieData.language}</li>
                <li class="ingredient">Status: ${movieData.status}</li>
                <li class="ingredient">Release: ${movieData.premiered}</li>
                <li class="ingredient"><a href="${movieData.officialSite}" target="blank">Official Site</a></li>
            </ul>${commentSection.innerHTML}
            <form class="add-comment-form">
                <h3 class="add-comment-title" >Add a comment</h3>
                <input class="input-name" type="text" placeholder="Name" required>
                <textarea class="comment-area" placeholder="Leave a comment" required></textarea>
                <button class="submit-comment">Comment</button>
            </form>
        </section>`;
      const body = document.querySelector('body');
      body.appendChild(popUp);
      const closeCross = document.querySelector('.cross');
      closeCross.addEventListener('click', () => {
        body.removeChild(popUp);
        body.classList.remove('no-scroll');
      });
      body.classList.add('no-scroll');

      const submitComment = document.querySelector('.submit-comment');
      submitComment.addEventListener('submit', (e) => {
        e.preventDefault();
        const movieId = button.parentElement.parentElement.id;
        const name = document.querySelector('.input-name');
        const comment = document.querySelector('.comment-area');
        involvementConnection.postComment(movieId, name.value, comment.value);
        name.value = '';
        comment.value = '';
      });
    });
  });
});

itemsContainer.addEventListener('click', async (e) => {
  const { target } = e;
  const classList = [...target.classList];
  if (classList.includes('card-heart')) {
    const { id } = target.dataset;
    target.classList.add('heart-beat');
    const resStatus = await involvementConnection.postLike(id);
    if (resStatus === 201) {
      target.src = filledHeartIcon;
      const likesCounter = target.nextElementSibling.firstElementChild;
      const newCount = parseInt(likesCounter.textContent, 10) + 1;
      likesCounter.textContent = newCount;
    }
    target.classList.remove('heart-beat');
  }
});
