/**
 * Luxon 日期时间库集成
 * 为表达式引擎提供强大的日期时间处理能力
 */

import { DateTime, Duration, Info, Interval } from "luxon"
import type { ExpressionContext } from "../types/index.js"

/**
 * 创建安全的Luxon对象，供表达式使用
 */
export function createLuxonContext(): Record<string, unknown> {
  return {
    // DateTime 类 - 主要的日期时间对象
    DateTime: {
      // 创建方法
      now: DateTime.now.bind(DateTime),
      local: DateTime.local.bind(DateTime),
      utc: DateTime.utc.bind(DateTime),
      fromJSDate: DateTime.fromJSDate.bind(DateTime),
      fromMillis: DateTime.fromMillis.bind(DateTime),
      fromSeconds: DateTime.fromSeconds.bind(DateTime),
      fromObject: DateTime.fromObject.bind(DateTime),
      fromISO: DateTime.fromISO.bind(DateTime),
      fromRFC2822: DateTime.fromRFC2822.bind(DateTime),
      fromHTTP: DateTime.fromHTTP.bind(DateTime),
      fromFormat: DateTime.fromFormat.bind(DateTime),
      fromSQL: DateTime.fromSQL.bind(DateTime),

      // 实用方法
      min: DateTime.min.bind(DateTime),
      max: DateTime.max.bind(DateTime),
      isDateTime: DateTime.isDateTime.bind(DateTime),

      // 预定义格式常量
      DATE_SHORT: DateTime.DATE_SHORT,
      DATE_MED: DateTime.DATE_MED,
      DATE_MED_WITH_WEEKDAY: DateTime.DATE_MED_WITH_WEEKDAY,
      DATE_FULL: DateTime.DATE_FULL,
      DATE_HUGE: DateTime.DATE_HUGE,
      TIME_SIMPLE: DateTime.TIME_SIMPLE,
      TIME_WITH_SECONDS: DateTime.TIME_WITH_SECONDS,
      TIME_WITH_SHORT_OFFSET: DateTime.TIME_WITH_SHORT_OFFSET,
      TIME_WITH_LONG_OFFSET: DateTime.TIME_WITH_LONG_OFFSET,
      TIME_24_SIMPLE: DateTime.TIME_24_SIMPLE,
      TIME_24_WITH_SECONDS: DateTime.TIME_24_WITH_SECONDS,
      TIME_24_WITH_SHORT_OFFSET: DateTime.TIME_24_WITH_SHORT_OFFSET,
      TIME_24_WITH_LONG_OFFSET: DateTime.TIME_24_WITH_LONG_OFFSET,
      DATETIME_SHORT: DateTime.DATETIME_SHORT,
      DATETIME_SHORT_WITH_SECONDS: DateTime.DATETIME_SHORT_WITH_SECONDS,
      DATETIME_MED: DateTime.DATETIME_MED,
      DATETIME_MED_WITH_SECONDS: DateTime.DATETIME_MED_WITH_SECONDS,
      DATETIME_MED_WITH_WEEKDAY: DateTime.DATETIME_MED_WITH_WEEKDAY,
      DATETIME_FULL: DateTime.DATETIME_FULL,
      DATETIME_FULL_WITH_SECONDS: DateTime.DATETIME_FULL_WITH_SECONDS,
      DATETIME_HUGE: DateTime.DATETIME_HUGE,
      DATETIME_HUGE_WITH_SECONDS: DateTime.DATETIME_HUGE_WITH_SECONDS,
    },

    // Duration 类 - 时间间隔
    Duration: {
      fromMillis: Duration.fromMillis.bind(Duration),
      fromObject: Duration.fromObject.bind(Duration),
      fromDurationLike: Duration.fromDurationLike.bind(Duration),
      fromISO: Duration.fromISO.bind(Duration),
      fromISOTime: Duration.fromISOTime.bind(Duration),
      isDuration: Duration.isDuration.bind(Duration),
    },

    // Interval 类 - 时间区间
    Interval: {
      fromDateTimes: Interval.fromDateTimes.bind(Interval),
      after: Interval.after.bind(Interval),
      before: Interval.before.bind(Interval),
      fromISO: Interval.fromISO.bind(Interval),
      isInterval: Interval.isInterval.bind(Interval),
      merge: Interval.merge.bind(Interval),
      xor: Interval.xor.bind(Interval),
    },

    // Info 类 - 系统信息
    Info: {
      hasDST: Info.hasDST.bind(Info),
      isValidIANAZone: Info.isValidIANAZone.bind(Info),
      normalizeZone: Info.normalizeZone.bind(Info),
      months: Info.months.bind(Info),
      monthsFormat: Info.monthsFormat.bind(Info),
      weekdays: Info.weekdays.bind(Info),
      weekdaysFormat: Info.weekdaysFormat.bind(Info),
      meridiems: Info.meridiems.bind(Info),
      eras: Info.eras.bind(Info),
      features: Info.features.bind(Info),
    },
  }
}

/**
 * 增强表达式上下文，添加Luxon支持
 */
export function enhanceContextWithLuxon(context: ExpressionContext): ExpressionContext {
  const luxonContext = createLuxonContext()

  // 创建增强的 Date 对象，添加 toFormat 方法
  const createEnhancedDate = (dateTime: DateTime) => {
    const date = dateTime.toJSDate()
    // 给 Date 对象添加 toFormat 方法
    ;(date as any).toFormat = (format: string) => dateTime.toFormat(format)
    return date
  }

  return {
    ...context,
    ...luxonContext,

    // 增强 $today 和 $now 变量 - 保持为 Date 对象但添加 toFormat 方法
    $today: createEnhancedDate(DateTime.now().startOf("day")),
    $now: createEnhancedDate(DateTime.now()),
  }
}

/**
 * 常用的日期时间表达式示例
 */
export const LUXON_EXAMPLES = {
  // 创建日期时间
  now: "{{ DateTime.now() }}",
  today: "{{ $today }}",
  specificDate: '{{ DateTime.fromISO("2023-12-25") }}',
  fromFormat: '{{ DateTime.fromFormat("23/12/2023", "dd/MM/yyyy") }}',

  // 日期运算
  addDays: "{{ $today.plus({ days: 7 }) }}",
  subtractDays: "{{ $now.minus({ days: 30 }) }}",
  startOfMonth: '{{ $today.startOf("month") }}',
  endOfYear: '{{ $today.endOf("year") }}',

  // 格式化
  formatISO: "{{ $now.toISO() }}",
  formatCustom: '{{ $now.toFormat("yyyy-MM-dd HH:mm:ss") }}',
  formatLocale: "{{ $now.toLocaleString(DateTime.DATETIME_MED) }}",

  // 日期比较
  diff: '{{ $now.diff($today, "hours").hours }}',
  isBefore: '{{ $today.startOf("day") < $now }}',
  isWeekend: "{{ $now.isWeekend }}",

  // 时区处理
  setZone: '{{ $now.setZone("America/New_York") }}',
  toUTC: "{{ $now.toUTC() }}",

  // 复杂示例
  daysToChristmas:
    '{{ Math.abs($today.diff(DateTime.fromObject({ month: 12, day: 25, year: $today.year }), "days").days) }}',
  workingDays:
    '{{ Math.max(0, $today.plus({ days: 30 }).diff($today, "days").days - Math.floor($today.plus({ days: 30 }).diff($today, "days").days / 7) * 2) }}',
}
