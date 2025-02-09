{include file='header' pageTitle='wcf.acp.user.rank.list'}

<script data-relocate="true">
	require(['Language', 'Ui/Notification', 'WoltLabSuite/Core/Acp/Ui/Worker'], function (Language, UiNotification, AcpUiWorker) {
		Language.add('wcf.acp.worker.abort.confirmMessage', '{jslang}wcf.acp.worker.abort.confirmMessage{/jslang}');
		
		document.getElementById('updateEvents').addEventListener('click', function (event) {
			event.preventDefault();
			
			new AcpUiWorker({
				dialogId: 'updateEvents',
				dialogTitle: '{jslang}wcf.acp.user.activityPoint.updateEvents{/jslang}',
				className: 'wcf\\system\\worker\\UserActivityPointUpdateEventsWorker',
				callbackSuccess: () => UiNotification.show()
			});
		});
	});
</script>

<header class="contentHeader">
	<div class="contentHeaderTitle">
		<h1 class="contentTitle">{lang}wcf.acp.user.rank.list{/lang} <span class="badge badgeInverse">{#$items}</span></h1>
	</div>
	
	<nav class="contentHeaderNavigation">
		<ul>
			<li><a id="updateEvents" class="button"><span class="icon icon16 fa-repeat"></span> <span>{lang}wcf.acp.user.activityPoint.updateEvents{/lang}</span></a></li>
			<li><a href="{link controller='UserRankAdd'}{/link}" class="button"><span class="icon icon16 fa-plus"></span> <span>{lang}wcf.acp.user.rank.add{/lang}</span></a></li>
			
			{event name='contentHeaderNavigation'}
		</ul>
	</nav>
</header>

{hascontent}
	<div class="paginationTop">
		{content}{pages print=true assign=pagesLinks controller="UserRankList" link="pageNo=%d&sortField=$sortField&sortOrder=$sortOrder"}{/content}
	</div>
{/hascontent}

{if $objects|count}
	<div class="section tabularBox">
		<table class="table jsObjectActionContainer" data-object-action-class-name="wcf\data\user\rank\UserRankAction">
			<thead>
				<tr>
					<th class="columnID columnRankID{if $sortField == 'rankID'} active {@$sortOrder}{/if}" colspan="2"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=rankID&sortOrder={if $sortField == 'rankID' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.global.objectID{/lang}</a></th>
					<th class="columnTitle columnRankTitle{if $sortField == 'rankTitle'} active {@$sortOrder}{/if}"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=rankTitle&sortOrder={if $sortField == 'rankTitle' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.acp.user.rank.title{/lang}</a></th>
					<th class="columnText columnRankImage{if $sortField == 'rankImage'} active {@$sortOrder}{/if}"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=rankImage&sortOrder={if $sortField == 'rankImage' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.acp.user.rank.image{/lang}</a></th>
					<th class="columnText columnGroupID{if $sortField == 'groupID'} active {@$sortOrder}{/if}"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=groupID&sortOrder={if $sortField == 'groupID' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.user.group{/lang}</a></th>
					<th class="columnText columnRequiredGender{if $sortField == 'requiredGender'} active {@$sortOrder}{/if}"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=requiredGender&sortOrder={if $sortField == 'requiredGender' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.user.option.gender{/lang}</a></th>
					<th class="columnDigits columnRequiredPoints{if $sortField == 'requiredPoints'} active {@$sortOrder}{/if}"><a href="{link controller='UserRankList'}pageNo={@$pageNo}&sortField=requiredPoints&sortOrder={if $sortField == 'requiredPoints' && $sortOrder == 'ASC'}DESC{else}ASC{/if}{/link}">{lang}wcf.acp.user.rank.requiredPoints{/lang}</a></th>
					
					{event name='columnHeads'}
				</tr>
			</thead>
			
			<tbody class="jsReloadPageWhenEmpty">
				{foreach from=$objects item=userRank}
					<tr class="jsUserRankRow jsObjectActionObject" data-object-id="{@$userRank->getObjectID()}">
						<td class="columnIcon">
							<a href="{link controller='UserRankEdit' id=$userRank->rankID}{/link}" title="{lang}wcf.global.button.edit{/lang}" class="jsTooltip"><span class="icon icon16 fa-pencil"></span></a>
							{objectAction action="delete" objectTitle=$userRank->getTitle()}
							
							{event name='rowButtons'}
						</td>
						<td class="columnID columnRankID">{@$userRank->rankID}</td>
						<td class="columnTitle columnRankTitle"><a href="{link controller='UserRankEdit' id=$userRank->rankID}{/link}" title="{lang}wcf.acp.user.rank.edit{/lang}" class="badge label{if $userRank->cssClassName} {$userRank->cssClassName}{/if}">{$userRank->getTitle()}</a></td>
						<td class="columnText columnRankImage">{if $userRank->rankImage}{@$userRank->getImage()}{/if}</td>
						<td class="columnText columnGroupID">{$userRank->groupName|phrase}</td>
						<td class="columnText columnRequiredGender">
							{if $userRank->requiredGender}
								{if $userRank->requiredGender == 1}
									{lang}wcf.user.gender.male{/lang}
								{elseif $userRank->requiredGender == 2}
									{lang}wcf.user.gender.female{/lang}
								{else}
									{lang}wcf.user.gender.other{/lang}
								{/if}
							{/if}
						</td>
						<td class="columnDigits columnRequiredPoints">{#$userRank->requiredPoints}</td>
						
						{event name='columns'}
					</tr>
				{/foreach}
			</tbody>
		</table>
	</div>
	
	<footer class="contentFooter">
		{hascontent}
			<div class="paginationBottom">
				{content}{@$pagesLinks}{/content}
			</div>
		{/hascontent}
		
		<nav class="contentFooterNavigation">
			<ul>
				<li><a href="{link controller='UserRankAdd'}{/link}" class="button"><span class="icon icon16 fa-plus"></span> <span>{lang}wcf.acp.user.rank.add{/lang}</span></a></li>
				
				{event name='contentFooterNavigation'}
			</ul>
		</nav>
	</footer>
{else}
	<p class="info">{lang}wcf.global.noItems{/lang}</p>
{/if}

{include file='footer'}
