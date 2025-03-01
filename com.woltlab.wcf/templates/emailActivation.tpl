{include file='header' __disableAds=true}

{include file='formError'}

<form method="post" action="{link controller='EmailActivation'}{/link}">
	<div class="section">
		<dl{if $errorField == 'u'} class="formError"{/if}>
			<dt><label for="userID">{lang}wcf.user.userID{/lang}</label></dt>
			<dd>
				<input type="text" id="userID" name="u" value="{@$u}" required class="medium">
				{if $errorField == 'u'}
					<small class="innerError">
						{if $errorType == 'empty'}
							{lang}wcf.global.form.error.empty{/lang}
						{else}
							{lang}wcf.user.userID.error.{@$errorType}{/lang}
						{/if}
					</small>
				{/if}
			</dd>
		</dl>
		
		<dl{if $errorField == 'a'} class="formError"{/if}>
			<dt><label for="activationCode">{lang}wcf.user.activationCode{/lang}</label></dt>
			<dd>
				<input type="text" id="activationCode" maxlength="9" name="a" value="{@$a}" required class="medium">
				{if $errorField == 'a'}
					<small class="innerError">
						{if $errorType == 'empty'}
							{lang}wcf.global.form.error.empty{/lang}
						{else}
							{lang}wcf.user.activationCode.error.{@$errorType}{/lang}
						{/if}
					</small>
				{/if}
				<small><a href="{link controller='EmailNewActivationCode'}{/link}">{lang}wcf.user.newActivationCode{/lang}</a></small>
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
