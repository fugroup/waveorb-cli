module.exports = async function($) {
  $.page.title = 'Home'

  return /* html */`
    <h1>home</h1>
    <p>
      this is your shiny new <strong>blazing</strong> fast
      <a href="https://github.com/eldoy/waveorb" target="_blank">waveorb app!</a>
    </p>
  `
}
