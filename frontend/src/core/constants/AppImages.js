import undoGif from 'assets/gifs/gif_undo.gif';
import clearGif from 'assets/gifs/gif_clear.gif';
import logoGif from 'assets/gifs/gif_logo.gif';
import questionGif from 'assets/gifs/gif_question.gif';
import tutorialGif from 'assets/gifs/gif_tutorial.gif';
import howToPlay1 from 'assets/gifs/gif_step1.gif'
import howToPlay2 from 'assets/gifs/gif_step2.gif'
import howToPlay3 from 'assets/gifs/gif_step3.gif'


class AppImages {
  static Undo = undoGif;
  static Clear = clearGif;
  static Logo = logoGif;
  static Question = questionGif;
  static Tutorial = tutorialGif;
  static HowToPlay = [
  howToPlay1,
  howToPlay2,
  howToPlay3,
];
}

export default AppImages;