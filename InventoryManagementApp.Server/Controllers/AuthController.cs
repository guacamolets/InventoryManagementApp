using InventoryManagementApp.Server.Dto;
using InventoryManagementApp.Server.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AspNet.Security.OAuth.GitHub;

namespace InventoryManagementApp.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
            return Unauthorized("Invalid email or password");

        var passwordValid = await _userManager.CheckPasswordAsync(user, model.Password);

        var result = await _signInManager.PasswordSignInAsync(
            user,
            model.Password,
            isPersistent: false,
            lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                result.Succeeded,
                result.IsLockedOut,
                result.IsNotAllowed,
                result.RequiresTwoFactor
            });
        }

        return Ok();
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        if (!User.Identity.IsAuthenticated)
            return Unauthorized();

        var user = await _userManager.GetUserAsync(User);
        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            userId = user.Id,
            userEmail = user.Email,
            userName = user.UserName,
            role = roles.FirstOrDefault()
        });
    }

    [HttpGet("google")]
    [AllowAnonymous]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties { RedirectUri = "/api/auth/response" };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("github")]
    [AllowAnonymous]
    public IActionResult GithubLogin()
    {
        var properties = new AuthenticationProperties { RedirectUri = "/api/auth/response" };
        return Challenge(properties, "GitHub");
    }
    
    [HttpGet("response")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginCallback()
    {
        var authResult = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!authResult.Succeeded || authResult.Principal == null)
        {
            return Redirect("/login");
        }

        var loginProvider = authResult.Properties.Items.ContainsKey("LoginProvider")
            ? authResult.Properties.Items["LoginProvider"]
            : "Google";

        var providerKey = authResult.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(providerKey))
        {
            return Content("Google ID not found in claims.");
        }

        var frontendUrl = _configuration["FrontendUrl"];
        var signInResult = await _signInManager.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent: true);
        if (signInResult.Succeeded)
        {
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return Redirect(frontendUrl ?? "/");
        }

        var email = authResult.Principal.FindFirstValue(ClaimTypes.Email);
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = email, Email = email };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Content("Registration error");
            }
        }

        await _userManager.AddLoginAsync(user, new UserLoginInfo(loginProvider, providerKey, loginProvider));
        await _signInManager.SignInAsync(user, true);
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        return Redirect(frontendUrl ?? "/");
    }
}