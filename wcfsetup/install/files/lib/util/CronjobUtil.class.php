<?php

namespace wcf\util;

use wcf\system\exception\SystemException;

/**
 * Provides methods used for cron-like time calculations.
 * As against the official cron-documentation, this implementation
 * does not support using nicknames (prefixed by the '@' character).
 *
 * Notice: This class used `gmdate()`/`gmmktime()` in previous versions,
 * but now utilized the `date()`/`mktime()` counter-parts, but with the
 * timezone set to the value of the `TIMEZONE` option.
 *
 * @author  Alexander Ebert
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\Util
 */
final class CronjobUtil
{
    /**
     * indicates if day of month is restricted (not '*')
     * @var bool
     */
    protected static $domRestricted = false;

    /**
     * indicates if day of week is restricted (not '*')
     * @var bool
     */
    protected static $dowRestricted = false;

    /**
     * result date
     * @var int[]
     */
    protected static $result = [];

    /**
     * time base used as reference for finding the next execution time
     * @var int
     */
    protected static $timeBase = 0;

    /**
     * valid ranges for each known field (range for 'day of month' is missing
     * since it varies from month to month)
     * @var int[]
     */
    public static $ranges = [
        'minute' => [0, 59],
        'hour' => [0, 23],
        'dom' => [1, 31],
        'month' => [1, 12],
        'dow' => [0, 6],
    ];

    /**
     * Calculates timestamp for next execution based on cron-like expressions and a given time base.
     *
     * @param string $minute
     * @param string $hour
     * @param string $dom
     * @param string $month
     * @param string $dow
     * @param int $timeBase
     * @return  int
     */
    public static function calculateNextExec($minute, $hour, $dom, $month, $dow, $timeBase = TIME_NOW)
    {
        // using the native `date()` and `mktime()` functions is dangerous
        // unless we explicitly set the correct timezone
        $originalTimezone = \date_default_timezone_get();
        if ($originalTimezone !== TIMEZONE) {
            \date_default_timezone_set(TIMEZONE);
        }

        // initialize fields
        self::$timeBase = $timeBase;
        self::$result = [
            'minute' => 0,
            'hour' => 0,
            'day' => 0,
            'month' => 0,
            'year' => 0,
        ];

        $fields = [
            'minute' => $minute,
            'hour' => $hour,
            'dom' => $dom,
            'month' => $month,
            'dow' => $dow,
        ];

        self::$domRestricted = ($dom != '*') ? true : false;
        self::$dowRestricted = ($dow != '*') ? true : false;

        $dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        $monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        // calculate values based upon each expression
        $values = [];
        foreach ($fields as $fieldName => $fieldValue) {
            $fieldValue = \mb_strtolower($fieldValue);

            // Names can also be used for the "month" and "day of week" fields.
            // Use the first three letters of the particular day or month (case
            // doesn't matter). Ranges or lists of names are not allowed.
            // -- crontab (5)

            switch ($fieldName) {
                case 'dow':
                    if (\strlen($fieldValue) == 3 && \in_array($fieldValue, $dayNames)) {
                        $fieldValue = \array_search($fieldValue, $dayNames);
                    }
                    // When specifying day of week, both day 0 and day 7
                    // will be considered Sunday. -- crontab(5)
                    elseif ($fieldValue == 7) {
                        $fieldValue = 0;
                    }
                    break;

                case 'month':
                    if (\strlen($fieldValue) == 3 && \in_array($fieldValue, $monthNames)) {
                        $fieldValue = \array_search($fieldValue, $monthNames) + 1;
                    }
                    break;
            }

            $values[$fieldName] = self::calculateValue($fieldName, $fieldValue);
        }

        // calculate date of next execution
        self::calculateTime($values);

        // return timestamp
        $timestamp = \mktime(
            self::$result['hour'],
            self::$result['minute'],
            1,
            self::$result['month'],
            self::$result['day'],
            self::$result['year']
        );

        // restore the original timezone
        if ($originalTimezone !== TIMEZONE) {
            \date_default_timezone_set($originalTimezone);
        }

        return $timestamp;
    }

    /**
     * Calculates the date of next execution.
     *
     * @param array $values
     */
    protected static function calculateTime(array &$values)
    {
        self::calculateDay($values);
    }

    /**
     * Calculates the next month and year to match given criteria.
     *
     * @param int $month
     * @param int $year
     * @param array $values
     * @return      array
     */
    protected static function calculateMonth($month, $year, array &$values)
    {
        $index = self::findKey($month, $values['month']);

        // swap to the next year if the next execution month is before the current month
        if ($values['month'][$index] < $month) {
            $year++;
        }

        return [
            'month' => $values['month'][$index],
            'year' => $year,
        ];
    }

    /**
     * Calculates the day while adjusting month and year to match given criteria.
     *
     * Note: The day of a command's execution can be specified by two fields - day
     * of month, and day of week. If both fields are restricted , that is not '*', the
     * command will be run when either field matches the current time. -- crontab(5)
     *
     * @param array $values
     * @see     \wcf\util\CronjobUtil::getDom()
     */
    protected static function calculateDay(array &$values)
    {
        $addAnDay = self::calculateHour($values, self::$timeBase);
        $timeBase = self::$timeBase;

        if ($addAnDay) {
            $date = \explode('.', \date("d.m.Y", $timeBase));
            $timeBase = \mktime(0, 0, 1, (int)$date[1], (int)$date[0] + 1, (int)$date[2]);
        }

        $day = \date('j', $timeBase);
        $month = \date('n', $timeBase);
        $year = \date('Y', $timeBase);

        // calculate month of next execution and if its not the current one reset previous calculations
        $dateMonth = self::calculateMonth($month, $year, $values);
        if ($month != $dateMonth['month'] || $year != $dateMonth['year']) {
            $day = 1;
            $month = $dateMonth['month'];
            $year = $dateMonth['year'];

            $timeBase = \mktime(0, 0, 1, $month, $day, $year);

            if (!$addAnDay) {
                self::calculateHour($values, $timeBase);
            }
        }

        // calculate date of next execution based upon day of week
        $dateDow = self::calculateDow($month, $year, $values, $day);
        $dateDowTimestamp = \mktime(0, 0, 1, $dateDow['month'], $dateDow['day'], $dateDow['year']);

        // calculate date of next execution based upon day of month
        $dateDom = self::calculateDom($month, $year, $values, $day);
        $dateDomTimestamp = \mktime(0, 0, 1, $dateDom['month'], $dateDom['day'], $dateDom['year']);

        // pick the earlier date if both dom and dow are restricted
        if (self::$domRestricted && self::$dowRestricted) {
            if ($dateDowTimestamp < $dateDomTimestamp) {
                self::$result['day'] = $dateDow['day'];
                self::$result['month'] = $dateDow['month'];
                self::$result['year'] = $dateDow['year'];
            } else {
                self::$result['day'] = $dateDom['day'];
                self::$result['month'] = $dateDom['month'];
                self::$result['year'] = $dateDom['year'];
            }
        } else {
            if (self::$domRestricted) {
                self::$result['day'] = $dateDom['day'];
                self::$result['month'] = $dateDom['month'];
                self::$result['year'] = $dateDom['year'];
            } elseif (self::$dowRestricted) {
                self::$result['day'] = $dateDow['day'];
                self::$result['month'] = $dateDow['month'];
                self::$result['year'] = $dateDow['year'];
            } // neither dom nor dow are restricted, thus pick the date given by time base
            else {
                self::$result['day'] = $day;
                self::$result['month'] = $month;
                self::$result['year'] = $year;
            }
        }

        // compare day, month and year whether we have to recalculate hour and minute
        if (($day != self::$result['day']) || ($month != self::$result['month']) || ($year != self::$result['year'])) {
            // calculate new time base
            $timeBase = \mktime(0, 0, 1, self::$result['month'], self::$result['day'], self::$result['year']);

            self::calculateHour($values, $timeBase);
        }
    }

    /**
     * Calculates the date of next execution based upon a given set for day of week.
     *
     * @param int $month
     * @param int $year
     * @param array $values
     * @param int $day
     * @return  array
     */
    protected static function calculateDow($month, $year, array &$values, $day = 1)
    {
        $days = \date('t', \mktime(0, 0, 1, $month, $day, $year));

        for ($i = $day; $i <= $days; $i++) {
            // get dow
            $dow = \date('w', \mktime(0, 0, 1, $month, $i, $year));

            if (\in_array($dow, $values['dow'])) {
                return [
                    'day' => $i,
                    'month' => $month,
                    'year' => $year,
                ];
            }
        }

        // try next month
        $nextMonth = self::calculateMonth(++$month, $year, $values);

        return self::calculateDow($nextMonth['month'], $nextMonth['year'], $values);
    }

    /**
     * Calculates the date of next execution based upon a given set for day of month.
     *
     * @param int $month
     * @param int $year
     * @param array $values
     * @param int $day
     * @return  array
     */
    protected static function calculateDom($month, $year, array &$values, $day = 1)
    {
        $days = \date('t', \mktime(0, 0, 1, $month, $day, $year));

        for ($i = $day; $i <= $days; $i++) {
            if (\in_array($i, $values['dom'])) {
                return [
                    'day' => $i,
                    'month' => $month,
                    'year' => $year,
                ];
            }
        }

        // try next month
        $nextMonth = self::calculateMonth(++$month, $year, $values);

        return self::calculateDom($nextMonth['month'], $nextMonth['year'], $values);
    }

    /**
     * Calculates hour of next execution. Returns true if hour-declaration
     * has already elapsed, thus requiring at least one day to be added.
     *
     * @param array $values
     * @param int $timeBase
     * @return  bool
     */
    protected static function calculateHour(array &$values, &$timeBase)
    {
        $addAnDay = false;

        // compare hour
        $currentHour = \intval(\date('G', $timeBase));
        $index = self::findKey($currentHour, $values['hour'], false);
        if ($index === false) {
            $index = self::findKey($currentHour, $values['hour']);
            $addAnDay = true;
        }
        $hour = $values['hour'][$index];

        // calculate minutes
        $addAnHour = self::calculateMinute($values, $timeBase, $addAnDay);

        // only add an hour (potentially a day) if the current hour is the same
        // for which the minute-declaration has already elapsed
        if ($addAnHour && $hour == $currentHour) {
            $hour++;
            $index = self::findKey($hour, $values['hour'], false);

            if ($index === false) {
                $index = self::findKey($hour, $values['hour']);
                $addAnDay = true;

                $hour = $values['hour'][$index];
            }
        }

        self::$result['hour'] = $hour;

        return $addAnDay;
    }

    /**
     * Calculates minutes of next execution. Returns true if minute-declaration
     * has already elapsed, thus requiring at least one hour to be added.
     *
     * @param array $values
     * @param int $timeBase
     * @param bool $addAnDay
     * @return  bool
     */
    protected static function calculateMinute(array &$values, &$timeBase, $addAnDay)
    {
        $addAnHour = false;

        if ($addAnDay) {
            $minute = 0;
        } else {
            $minute = \date('i', $timeBase);
        }

        $index = self::findKey($minute, $values['minute'], false);

        // if index was out of bounds, pick the first item but
        // notify calling method that we had to increase the hour
        if ($index === false) {
            $index = self::findKey($minute, $values['minute']);
            $addAnHour = true;
        }

        self::$result['minute'] = $values['minute'][$index];

        return $addAnHour;
    }

    /**
     * Tries to find index of an array element which is bigger or equal the current
     * needle. If $continue is not set to false and foreach-loop is out of bounds,
     * then the array-index '0' is returned, referring the first item.
     *
     * @param int $needle
     * @param array $haystack
     * @param bool $continue
     * @return  mixed
     */
    protected static function findKey($needle, array &$haystack, $continue = true)
    {
        $index = \array_search($needle, $haystack);

        if ($index === false) {
            foreach ($haystack as $key => $value) {
                if ($needle < $value) {
                    $index = $key;
                    break;
                }
            }

            if ($continue && $index === false) {
                $index = 0;
            }
        }

        return $index;
    }

    /**
     * Calculates all values matching possible expressions.
     *
     * @param string $fieldName
     * @param string $fieldValue
     * @return  array
     */
    protected static function calculateValue($fieldName, $fieldValue)
    {
        $values = [];

        // examine first char
        $char = \mb_substr($fieldValue, 0, 1);

        // could be a single value, range or list
        if (\is_numeric($char)) {
            $items = self::getListItems($fieldValue);

            foreach ($items as $item) {
                $values = \array_merge($values, self::getRanges($item));
            }
        } // asterisk may be followed by a step value
        elseif ($char == '*') {
            $step = 1;

            if (\str_contains($fieldValue, '/')) {
                $rangeData = \explode('/', $fieldValue);
                $step = $rangeData[1];
            }

            $values = self::calculateRange(self::$ranges[$fieldName][0], self::$ranges[$fieldName][1], $step);
        }

        \sort($values, \SORT_NUMERIC);

        return $values;
    }

    /**
     * Tries to parse list items separated by a comma.
     *
     * @param string $fieldValue
     * @return  array
     */
    protected static function getListItems($fieldValue)
    {
        if (\str_contains($fieldValue, ',')) {
            return \explode(',', $fieldValue);
        }

        return [$fieldValue];
    }

    /**
     * Parses a possible range of values including a step value.
     *
     * @param string $value
     * @return  array
     */
    protected static function getRanges($value)
    {
        // this is a single value
        if (!\str_contains($value, '-')) {
            return [$value];
        }

        $step = 1;
        if (\str_contains($value, '/')) {
            $data = \explode('/', $value);
            $step = $data[1];
            $value = $data[0];
        }

        $data = \explode('-', $value);

        return self::calculateRange($data[0], $data[1], $step);
    }

    /**
     * Calculates all values for a given range.
     *
     * @param int $startValue
     * @param int $endValue
     * @param int $step
     * @return  array
     */
    protected static function calculateRange($startValue, $endValue, $step = 1)
    {
        $values = [];

        for ($i = $startValue; $i <= $endValue; $i = $i + $step) {
            $values[] = $i;
        }

        return $values;
    }

    /**
     * Validates all cronjob attributes.
     *
     * @param string $startMinute
     * @param string $startHour
     * @param string $startDom
     * @param string $startMonth
     * @param string $startDow
     */
    public static function validate($startMinute, $startHour, $startDom, $startMonth, $startDow)
    {
        self::validateAttribute('startMinute', $startMinute);
        self::validateAttribute('startHour', $startHour);
        self::validateAttribute('startDom', $startDom);
        self::validateAttribute('startMonth', $startMonth);
        self::validateAttribute('startDow', $startDow);
    }

    /**
     * Validates a cronjob attribute.
     *
     * @param string $name
     * @param string $value
     * @throws  SystemException
     */
    public static function validateAttribute($name, $value)
    {
        if ($value === '') {
            throw new SystemException("invalid value '" . $value . "' given for cronjob attribute '" . $name . "'");
        }

        $pattern = '';
        $step = '[1-9]?[0-9]';
        $months = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
        $days = 'mon|tue|wed|thu|fri|sat|sun';
        $namesArr = [];

        switch ($name) {
            case 'startMinute':
                // check if startMinute is a valid minute or a list of valid minutes.
                $pattern = '[ ]*(\b[0-5]?[0-9]\b)[ ]*';
                break;

            case 'startHour':
                // check if startHour is a valid hour or a list of valid hours.
                $pattern = '[ ]*(\b[01]?[0-9]\b|\b2[0-3]\b)[ ]*';
                break;

            case 'startDom':
                // check if startDom is a valid day of month or a list of valid days of month.
                $pattern = '[ ]*(\b[01]?[1-9]\b|\b2[0-9]\b|\b3[01]\b)[ ]*';
                break;

            case 'startMonth':
                // check if startMonth is a valid month or a list of valid months.
                $digits = '[ ]*(\b[0-1]?[0-9]\b)[ ]*';
                $namesArr = \explode('|', $months);
                $pattern = '(' . $digits . ')|([ ]*(' . $months . ')[ ]*)';
                break;

            case 'startDow':
                // check if startDow is a valid day of week or a list of valid days of week.
                $digits = '[ ]*(\b[0]?[0-7]\b)[ ]*';
                $namesArr = \explode('|', $days);
                $pattern = '(' . $digits . ')|([ ]*(' . $days . ')[ ]*)';
                break;
        }

        // perform the actual regex pattern matching.
        $range = '(((' . $pattern . ')|(\*\/' . $step . ')?)|(((' . $pattern . ')-(' . $pattern . '))(\/' . $step . ')?))';

        $longPattern = '/^' . $range . '(,' . $range . ')*$/i';

        if ($value != '*' && !\preg_match($longPattern, $value)) {
            throw new SystemException("invalid value '" . $value . "' given for cronjob attribute '" . $name . "'");
        } // test whether the user provided a meaningful order inside a range.
        else {
            $testArr = \explode(',', $value);
            foreach ($testArr as $testField) {
                if (
                    $pattern
                    && \preg_match('/^(((' . $pattern . ')-(' . $pattern . '))(\/' . $step . ')?)+$/', $testField)
                ) {
                    $compare = \explode('-', $testField);
                    $compareSlash = \explode('/', $compare['1']);
                    if (\count($compareSlash) == 2) {
                        $compare['1'] = $compareSlash['0'];
                    }

                    // see if digits or names are being given.
                    $left = \array_search(\mb_strtolower($compare['0']), $namesArr);
                    $right = \array_search(\mb_strtolower($compare['1']), $namesArr);
                    if (!$left) {
                        $left = $compare['0'];
                    }
                    if (!$right) {
                        $right = $compare['1'];
                    }
                    // now check the values.
                    if (\intval($left) > \intval($right)) {
                        throw new SystemException("invalid value '" . $value . "' given for cronjob attribute '" . $name . "'");
                    }
                }
            }
        }
    }

    /**
     * Forbid creation of CronjobUtil objects.
     */
    private function __construct()
    {
        // does nothing
    }
}
