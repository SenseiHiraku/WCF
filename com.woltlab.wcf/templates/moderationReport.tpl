{capture assign='pageTitle'}{$__wcf->getActivePage()->getTitle()}: {$queue->getTitle()}{/capture}

{capture assign='contentHeader'}
	<header class="contentHeader">
		<div class="contentHeaderTitle">
			<h1 class="contentTitle">{$__wcf->getActivePage()->getTitle()}</h1>
			
			{if $queue->lastChangeTime}
				<dl class="plain inlineDataList">
					<dt>{lang}wcf.moderation.lastChangeTime{/lang}</dt>
					<dd>{@$queue->lastChangeTime|time}</dd>
				</dl>
			{/if}
			
			<dl class="plain inlineDataList" id="moderationAssignedUserContainer">
				<dt>{lang}wcf.moderation.assignedUser{/lang}</dt>
				<dd>
					<span>
						{if $queue->assignedUserID}
							<a href="{link controller='User' id=$assignedUserID}{/link}" class="userLink" data-object-id="{@$assignedUserID}">{$queue->assignedUsername}</a>
						{else}
							{lang}wcf.moderation.assignedUser.nobody{/lang}
						{/if}
					</span>
				</dd>
			</dl>
			
			<dl class="plain inlineDataList" id="moderationStatusContainer">
				<dt>{lang}wcf.moderation.status{/lang}</dt>
				<dd>{$queue->getStatus()}</dd>
			</dl>
		</div>
		
		{hascontent}
			<nav class="contentHeaderNavigation">
				<ul>
					{content}
						{if $queue->getAffectedObject()}<li><a href="{$queue->getAffectedObject()->getLink()}" class="button buttonPrimary"><span class="icon icon16 fa-arrow-right"></span> <span>{lang}wcf.moderation.jumpToContent{/lang}</span></a></li>{/if}
						{event name='contentHeaderNavigation'}
					{/content}
				</ul>
			</nav>
		{/hascontent}
	</header>
{/capture}

{capture assign='contentInteractionButtons'}
	<a id="moderationAssignUser" class="contentInteractionButton button small jsOnly"><span class="icon icon16 fa-user-plus"></span> <span>{lang}wcf.moderation.assignedUser.change{/lang}</span></a>
	{if !$queue->isDone()}
		{if $queueManager->canRemoveContent($queue->getDecoratedObject())}
			<a id="removeContent" class="contentInteractionButton button small jsOnly"><span class="icon icon16 fa-times"></span> <span>{lang}wcf.moderation.activation.removeContent{/lang}</span></a>
		{/if}
		<a id="removeReport" class="contentInteractionButton button small jsOnly"><span class="icon icon16 fa-check-square-o"></span> <span>{lang}wcf.moderation.report.removeReport{/lang}</span></a>
	{/if}
	{if $queue->canChangeJustifiedStatus()}
		<a id="changeJustifiedStatus" class="contentInteractionButton button small jsOnly"><span class="icon icon16 fa-refresh"></span> <span>{lang}wcf.moderation.report.changeJustifiedStatus{/lang}</span></a>
	{/if}
{/capture}

{include file='header'}

{include file='formError'}

<section class="section">
	<h2 class="sectionTitle">{lang}wcf.moderation.report.reportedBy{/lang}</h2>
	
	<div class="box32">
		{user object=$reportUser type='avatar32' ariaHidden='true' tabindex='-1'}
		
		<div>
			<div class="containerHeadline">
				<h3>
					{if $reportUser->userID}
						{user object=$reportUser}
					{else}
						{lang}wcf.user.guest{/lang}
					{/if}
					<small class="separatorLeft">{@$queue->time|time}</small>
				</h3>
			</div>
			
			<div class="containerContent">{@$queue->getFormattedMessage()}</div>
		</div>
	</div>
</section>

<section class="section">
	<header class="sectionHeader">
		<h2 class="sectionTitle">{lang}wcf.moderation.report.reportedContent{/lang}</h2>
		<p class="sectionDescription">{lang}wcf.moderation.type.{@$queue->getObjectTypeName()}{/lang}</p>
	</header>
	
	{@$reportedContent}
</section>

{include file='__commentJavaScript' commentContainerID='moderationQueueCommentList'}

<section id="comments" class="section sectionContainerList moderationComments">
	<header class="sectionHeader">
		<h2 class="sectionTitle">{lang}wcf.global.comments{/lang}{if $queue->comments} <span class="badge">{#$queue->comments}</span>{/if}</h2>
		<p class="sectionDescription">{lang}wcf.moderation.comments.description{/lang}</p>
	</header>
	
	<ul id="moderationQueueCommentList" class="commentList containerList" data-can-add="true" data-object-id="{@$queueID}" data-object-type-id="{@$commentObjectTypeID}" data-comments="{if $queue->comments}{@$commentList->countObjects()}{else}0{/if}" data-last-comment-time="{@$lastCommentTime}">
		{include file='commentListAddComment' wysiwygSelector='moderationQueueCommentListAddComment'}
		{include file='commentList'}
	</ul>
</section>

<script data-relocate="true">
	$(function() {
		WCF.Language.addObject({
			'wcf.moderation.assignedUser': '{jslang}wcf.moderation.assignedUser{/jslang}',
			'wcf.moderation.assignedUser.error.notAffected': '{jslang}wcf.moderation.assignedUser.error.notAffected{/jslang}',
			'wcf.moderation.report.removeContent.confirmMessage': '{jslang}wcf.moderation.report.removeContent.confirmMessage{/jslang}',
			'wcf.moderation.report.removeContent.reason': '{jslang}wcf.moderation.report.removeContent.reason{/jslang}',
			'wcf.moderation.report.removeReport.confirmMessage': '{jslang}wcf.moderation.report.removeReport.confirmMessage{/jslang}',
			'wcf.moderation.report.removeReport.markAsJustified': '{jslang}wcf.moderation.report.removeReport.markAsJustified{/jslang}',
			'wcf.moderation.report.removeReport.confirmMessage': '{jslang}wcf.moderation.report.removeReport.confirmMessage{/jslang}',
			'wcf.moderation.report.changeJustifiedStatus.markAsJustified': '{jslang}wcf.moderation.report.changeJustifiedStatus.markAsJustified{/jslang}',
			'wcf.moderation.report.changeJustifiedStatus.confirmMessage': '{jslang}wcf.moderation.report.changeJustifiedStatus.confirmMessage{/jslang}',
			'wcf.moderation.status.outstanding': '{jslang}wcf.moderation.status.outstanding{/jslang}',
			'wcf.moderation.status.processing': '{jslang}wcf.moderation.status.processing{/jslang}',
			'wcf.user.username.error.notFound': '{jslang __literal=true}wcf.user.username.error.notFound{/jslang}'
		});
		
		new WCF.Moderation.Report.Management(
			{@$queue->queueID},
			'{link controller='ModerationList' encode=false}{/link}',
			{if $queue->markAsJustified}true{else}false{/if}
		);
	});
</script>

{include file='footer'}
