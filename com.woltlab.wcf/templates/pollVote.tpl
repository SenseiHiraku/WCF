<dl class="wide pollVoteContainer" data-max-votes="{@$poll->maxVotes}">
	{foreach from=$poll->getOptions() item=option}
		<dt></dt>
		<dd>
			<label>
				{if $poll->canVote()}<input type="{if $poll->maxVotes > 1}checkbox{else}radio{/if}" name="pollOptions{@$poll->pollID}[]" value="{@$option->optionID}"{if $option->voted} checked{/if}>{/if}
				{$option->optionValue}
			</label>
		</dd>
	{/foreach}
</dl>
{if $poll->canVote()}
	{if $poll->maxVotes > 1}<p><small>{lang}wcf.poll.multipleVotes{/lang}</small></p>{/if}
	{if $poll->endTime}<p><small>{lang}wcf.poll.endTimeInfo{/lang}</small></p>{/if}
	{if $poll->isPublic}<p><small>{lang}wcf.poll.isPublic{/lang}</small></p>{/if}
{else}
	<p><small>{lang}wcf.poll.restrictedResult{/lang}</small></p>
{/if}
