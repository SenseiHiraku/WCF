{include file='header' __disableAds=true}

{if $__wcf->user->userID && !$__wcf->user->isEmailConfirmed()}<p class="info" role="status">{lang}wcf.user.registerActivation.info{/lang}</p>{/if}

{include file='formError'}

<form method="post" action="{link controller='RegisterActivation'}{/link}">
	<div class="section">
		<dl{if $errorField == 'username'} class="formError"{/if}>
			<dt><label for="username">{lang}wcf.user.username{/lang}</label></dt>
			<dd>
				<input type="text" id="username" name="username" value="{$username}" required class="medium">
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
		
		<dl{if $errorField == 'activationCode'} class="formError"{/if}>
			<dt><label for="activationCode">{lang}wcf.user.activationCode{/lang}</label></dt>
			<dd>
				<input type="text" id="activationCode" maxlength="40" name="activationCode" value="{@$activationCode}" required class="medium">
				{if $errorField == 'activationCode'}
					<small class="innerError">
						{if $errorType == 'empty'}
							{lang}wcf.global.form.error.empty{/lang}
						{else}
							{lang}wcf.user.activationCode.error.{@$errorType}{/lang}
						{/if}
					</small>
				{/if}
				<small><a href="{link controller='RegisterNewActivationCode'}{/link}">{lang}wcf.user.newActivationCode{/lang}</a></small>
			</dd>
		</dl>
		
		{event name='fields'}
	</div>
	
	{event name='sections'}
	
	<div class="formSubmit">
		<input type="submit" value="{lang}wcf.global.button.submit{/lang}" accesskey="s">
		{csrfToken}
	</div>
</form>

{include file='footer' __disableAds=true}
