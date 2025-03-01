{if !$serverAuthData|empty}
	{if $authInsufficient}
		<p class="warning">{lang}wcf.acp.package.update.authInsufficient{/lang}</p>
	{else}
		<p class="{if $serverReply[statusCode] == 401}error{else}warning{/if}">{lang}wcf.acp.package.update.errorCode.{@$serverReply[statusCode]}{/lang}</p>
	{/if}
{/if}

<section class="section">
	<h2 class="sectionTitle">{lang}wcf.acp.package.update.server{/lang}</h2>
	
	{if $packageUpdateVersion[packageName]|isset}
		<dl>
			<dt>{lang}wcf.acp.package.name{/lang}</dt>
			<dd>{$packageUpdateVersion[packageName]} ({$packageUpdateVersion[packageVersion]})</dd>
		</dl>
	{/if}
	<dl>
		<dt>{lang}wcf.acp.package.update.server.url{/lang}</dt>
		<dd>{@$updateServer->getHighlightedURL()}</dd>
	</dl>
	
	<dl>
		<dt>{lang}wcf.acp.package.update.server.message{/lang}</dt>
		<dd>{$serverReply[body]}</dd>
	</dl>
</section>

<section class="section">
	<header class="sectionHeader">
		<h2 class="sectionTitle">{lang}wcf.acp.package.update.credentials{/lang}</h2>
		{if $updateServer->isWoltLabUpdateServer()}
			<p class="sectionDescription">{lang}wcf.acp.package.update.credentials.description{/lang}</p>
		{/if}
	</header>
	
	<dl>
		<dt><label for="packageUpdateServerUsername">{lang}wcf.acp.package.update.{if $updateServer->requiresLicense()}licenseNo{else}username{/if}{/lang}</label></dt>
		<dd><input type="text" id="packageUpdateServerUsername" value="{if $serverAuthData[username]|isset}{$serverAuthData[username]}{/if}" class="long"></dd>
	</dl>
	
	<dl>
		<dt><label for="packageUpdateServerPassword">{lang}wcf.acp.package.update.{if $updateServer->requiresLicense()}serialNo{else}password{/if}{/lang}</label></dt>
		<dd><input type="{if $updateServer->requiresLicense()}text{else}password{/if}" id="packageUpdateServerPassword" value="" class="long"></dd>
	</dl>
	
	<dl>
		<dt></dt>
		<dd><label><input type="checkbox" id="packageUpdateServerSaveCredentials" value="1"> {lang}wcf.acp.package.update.saveCredentials{/lang}</label></dd>
	</dl>
</section>

<div class="formSubmit">
	<button class="buttonPrimary" data-type="submit" data-package-update-server-id="{@$updateServer->packageUpdateServerID}">{lang}wcf.global.button.submit{/lang}</button>
</div>
