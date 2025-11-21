$(function () {
  const $signupPageButton = $(".signupPageBtn");
  const $loginPageButton = $(".loginPageBtn");
  const $loginButton = $(".loginBtn");
  const $loginForm = $(".loginForm");
  const $signupForm = $(".signupForm");

  const $loginSection = $(".login");
  const $signupSection = $(".signup");

  const $loginEmailInput = $(".login .email");
  const $loginPasswordInput = $(".login .password");

  const $signupEmailInput = $(".signup .email");
  const $username = $(".username");
  const $signPasswordInput = $(".signup .password");

  const $loginError = $(".login .error");
  const $signupError = $(".signup .error");

  const $showPass = $(".show-pass");
  const $hidePass = $(".hide-pass");

  $signupPageButton.on("click", function () {
    $loginSection.css("display", "none");
    $signupSection.css("display", "flex");
    $loginError.hide();
  });

  $loginPageButton.on("click", function () {
    $loginSection.css("display", "flex");
    $signupSection.css("display", "none");
    $signupError.hide();
  });

  $loginForm.on("submit", function (e) {
    e.preventDefault();

    if (
      $loginEmailInput.val() === "" ||
      $loginPasswordInput.val() === ""
    ) {
      $loginError.text("Please enter all required fields!").show();
      return;
    }
    $loginButton.prop("disabled", true).addClass("loading");
    $.getJSON("../js/data.json")
      .done(function (data) {
        const users = data.users || [];
        const foundUser = users.find(
          (user) =>
            user.email === $loginEmailInput.val() &&
            user.password === $loginPasswordInput.val()
        );

        if (foundUser) {
           sessionStorage.setItem("userId", foundUser.id);
          window.location.href = "../html/home.html";
        } else {
          $loginError.text("Incorrect email or password!").show();
          $loginEmailInput.val("");
          $loginPasswordInput.val("");
        }
      })
      .fail(function (err) {
        console.error("error fetching users:", err);
      })
      .always(function () {
        $loginButton.prop("disabled", false).removeClass("loading");
      });
  });

  $signupForm.on("submit", function (e) {
    e.preventDefault();

    if (
      $.trim($username.val()) === "" ||
      $.trim($signupEmailInput.val()) === "" ||
      $.trim($signPasswordInput.val()) === ""
    ) {
      $signupError.text("Please enter all required fields!").show();
      return;
    }

    if ($signPasswordInput.val().length < 8) {
      $signupError.text("Password must be at least 8 characters").show();
      return;
    }

    window.location.href = "../html/home.html";
  });

  $showPass.on("click", function () {
    const $btn = $(this);
    const $input = $btn.prev("input");

    $input.attr("type", "text");
    $btn.hide();
    $btn.next(".hide-pass").show();
  });
  $hidePass.on("click", function () {
    const $btn = $(this);
    const $input = $btn.prev().prev("input");

    $input.attr("type", "password");
    $btn.hide();
    $btn.prev(".show-pass").show();
  });

  const $loginTab = $(".loginTab");
  const $signupTab = $(".signupTab");

  $signupTab.on("click", function () {
    $signupTab.addClass("active");
    $loginTab.removeClass("active");

    $signupSection.addClass("show");
    $loginSection.hide(); 
  });

  $loginTab.on("click", function () {
    $loginTab.addClass("active");
    $signupTab.removeClass("active");

    $loginSection.show();
    $signupSection.removeClass("show");
  });
});
