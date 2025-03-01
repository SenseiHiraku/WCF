{include file='header' pageTitle='wcf.user.login' __isLogin=true}

<div id="login" class="acpLoginForm" style="display: none">
	<form method="post" action="{link controller='Login'}{/link}">
		{if !$errorField|empty && $errorField == 'cookie'}
			<p class="error">{lang}wcf.user.login.error.cookieRequired{/lang}</p>
		{else}
			{include file='formError'}
		{/if}
		
		<dl{if $errorField == 'username'} class="formError"{/if}>
			<dt><label for="username">{lang}wcf.user.username{/lang}</label></dt>
			<dd><input type="text" id="username" name="username" value="{$username}" required class="long" autocomplete="username">
				{if $errorField == 'username'}
					<small class="innerError">
						{if $errorType == 'empty'}
							{lang}wcf.global.form.error.empty{/lang}
						{else}
							{lang}wcf.user.username.error.{@$errorType}{/lang}
						{/if}
					</small>
				{/if}
			</dd>
		</dl>
		
		<dl{if $errorField == 'password'} class="formError"{/if}>
			<dt><label for="password">{lang}wcf.user.password{/lang}</label></dt>
			<dd><input type="password" id="password" name="password" value="" required class="long" autocomplete="current-password">
				{if $errorField == 'password'}
					<small class="innerError">
						{if $errorType == 'empty'}
							{lang}wcf.global.form.error.empty{/lang}
						{else}
							{lang}wcf.user.password.error.{@$errorType}{/lang}
						{/if}
					</small>
				{/if}
			</dd>
		</dl>
			
		{include file='captcha' supportsAsyncCaptcha=true}
		
		<div class="formSubmit">
			<input type="submit" value="{lang}wcf.global.button.submit{/lang}" accesskey="s">
			<input type="hidden" name="url" value="{$url}">
			{csrfToken}
		</div>
	</form>
</div>

<script data-relocate="true">
	document.addEventListener('DOMContentLoaded', function() {
		require(['Ui/Dialog'], function (UiDialog) {
			UiDialog.openStatic('login', null, {
				closable: false,
				title: '{jslang}wcf.user.login{/jslang}',
				onShow: function() {
					// The focus is set in Dialog.js via setTimeout(), so this has to be done the same way here.
					setTimeout(function() {
						if (elById('username').value === '' || '{$errorField}' === 'username') {
							elById('username').focus();
						}
						else {
							elById('password').focus();
						}
					}, 2);
				}
			});
		});
	});
</script>

{include file='footer'}
