<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
>
	<channel>
		<title><![CDATA[{if $title}{@$title|escapeCDATA} - {/if}{@PAGE_TITLE|phrase|escapeCDATA}]]></title>
		<link><![CDATA[{@$baseHref|escapeCDATA}]]></link>
		<description><![CDATA[{@PAGE_DESCRIPTION|phrase|escapeCDATA}]]></description>
		<language>{@$__wcf->language->getFixedLanguageCode()}</language>
		<pubDate>{'r'|gmdate:TIME_NOW}</pubDate>
{assign var='dummy' value=$items->rewind()}
		<lastBuildDate>{if $items->valid()}{'r'|gmdate:$items->current()->getTime()}{else}{'r'|gmdate:TIME_NOW}{/if}</lastBuildDate>
		<ttl>60</ttl>
		<generator><![CDATA[WoltLab Suite{if SHOW_VERSION_NUMBER} {@WCF_VERSION}{/if}]]></generator>
		<atom:link href="{$__wcf->getRequestURI()}" rel="self" type="application/rss+xml" />{*
		*}{event name='channelFields'}
{*		*}{foreach from=$items item='item'}
		<item>
			<title><![CDATA[{@$item->getTitle()|escapeCDATA}]]></title>
			<link><![CDATA[{@$item->getLink()|escapeCDATA}]]></link>
			{hascontent}<description><![CDATA[{content}{@$item->getExcerpt()|escapeCDATA}{/content}]]></description>{/hascontent}
			<pubDate>{'r'|gmdate:$item->getTime()}</pubDate>
			<dc:creator><![CDATA[{@$item->getUsername()|escapeCDATA}]]></dc:creator>
			<guid><![CDATA[{@$item->getLink()|escapeCDATA}]]></guid>
			{foreach from=$item->getCategories() item='category'}
				<category><![CDATA[{@$category|escapeCDATA}]]></category>
			{/foreach}
			{hascontent}<content:encoded><![CDATA[{content}{@$item->getFormattedMessage()|escapeCDATA}{/content}]]></content:encoded>{/hascontent}
			{if $supportsEnclosure && $item->getEnclosure()}<enclosure length="{@$item->getEnclosure()->getLength()}" type="{$item->getEnclosure()->getType()}" url="{$item->getEnclosure()->getURL()}" />{/if}
			<slash:comments><![CDATA[{@$item->getComments()|escapeCDATA}]]></slash:comments>{*
			*}{event name='itemFields'}
		</item>
{*		*}{/foreach}
	</channel>
{if ENABLE_BENCHMARK}
	<!-- 
		Execution time: {@$__wcf->getBenchmark()->getExecutionTime()}s ({#($__wcf->getBenchmark()->getExecutionTime()-$__wcf->getBenchmark()->getQueryExecutionTime())/$__wcf->getBenchmark()->getExecutionTime()*100}% PHP, {#$__wcf->getBenchmark()->getQueryExecutionTime()/$__wcf->getBenchmark()->getExecutionTime()*100}% SQL) | SQL queries: {#$__wcf->getBenchmark()->getQueryCount()} | Memory-Usage: {$__wcf->getBenchmark()->getMemoryUsage()}
	
{*	*}{if ENABLE_DEBUG_MODE}
{*		*}{foreach from=$__wcf->getBenchmark()->getItems() item=item}
{*	*}			{if $item.type == 1}(SQL Query) {/if}{$item.text} ({@$item.use}s)
{*		*}{/foreach}
{*	*}{/if}
	-->
{/if}
</rss>
