// Copyright 2022 Tony Barbitta
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Tracing data can be in two formats that chrome will accept:
 * - The first is simply an array of trace event objects.
 * - The second is a JSON object that contains a 'traceEvents' array, along with other information.
 * 
 */

const jsonArrayFormat = [
    { "name": "Asub", "cat": "PERF", "ph": "B", "pid": 22630, "tid": 22630, "ts": 829 },
    { "name": "Asub", "cat": "PERF", "ph": "E", "pid": 22630, "tid": 22630, "ts": 833 }
]

const jsonObjectFormat = {
    // See below for more information on traceEvent format.
    "traceEvents": [
        { "name": "Asub", "cat": "PERF", "ph": "B", "pid": 22630, "tid": 22630, "ts": 829 },
        { "name": "Asub", "cat": "PERF", "ph": "E", "pid": 22630, "tid": 22630, "ts": 833 }
    ],
    // If provided displayTimeUnit is a string that specifies in which unit timestamps should
    // be displayed. This supports values of “ms” or “ns”. By default this is value is “ms”.
    "displayTimeUnit": "ns",
    // If provided systemTraceEvents is a string of Linux ftrace data or Windows ETW trace
    // data. This data must start with # tracer: and adhere to the Linux ftrace format or
    // adhere to Windows ETW format.
    "systemTraceEvents": "SystemTraceData",
    // If provided, powerTraceAsString is a string of BattOr power data.
    "powerTraceAsString": "...",
    /* If provided, controllerTraceDataKey is a string that specifies which trace data comes
     * from tracing controller. Its value should be the key for that specific trace data. For 
     * example, {..., "controllerTraceDataKey": "traceEvents"} means the data for traceEvents
     * comes from the tracing controller. This is mainly for the purpose of clock synchronization. */
    "controllerTraceDataKey": "...",
    /* If provided, the stackFrames field is a dictionary of stack frames, their ids, and
     * their parents that allows compact representation of stack traces throughout the rest
     * of the trace file. It is optional but sometimes very useful in shrinking file sizes. */
    "stackFrames": {},
    /* The samples array is used to store sampling profiler data from a OS level profiler.
     * It stores samples that are different from trace event samples, and is meant to augment
     * the traceEvent data with lower level information. It is OK to have a trace event file
     * with just sample data, but in that case  traceEvents must still be provided and set to
     * []. For more information on sample data, refer to the global samples section. */
    "samples": [],
    /* Any other properties seen in the object, in this case otherData are assumed to be metadata
     * for the trace. They will be collected and stored in an array in the trace model. This 
     * metadata is accessible through the Metadata button in Trace Viewer. */
    "otherData": {
        "version": "My Application v1.0"
    },
}

const traceEventFormat = {
    // The name of the event, as displayed in Trace Viewer
    "name": "myName",
    // The event categories. This is a comma separated list of categories for the event.
    // The categories can be used to hide events in the Trace Viewer UI.
    "cat": "category,list",
    // The event type. This is a single character which changes depending on the type of
    // event being output. The valid values are listed in the table below. We will discuss
    // each phase type below.
    "ph": "B",
    // The tracing clock timestamp of the event. The timestamps are provided at microsecond granularity.
    "ts": 12345,
    // OPTIONAL. The thread clock timestamp of the event. The timestamps are provided at microsecond granularity.
    "tts": 12345,
    // The process ID for the process that output this event.
    "pid": 123,
    // The thread ID for the thread that output this event.
    "tid": 456,
    // OPTIONAL. The duration of the event.
    "dur": 123,
    // OPTIONAL. A fixed color name to associate with the event. If provided, cname must be one of the names
    // listed in trace-viewer's base color scheme's reserved color names list (see below).
    "cname": "blue",
    // Any arguments provided for the event. Some of the event types have required argument fields,
    // otherwise, you can put any information you wish in here. The arguments are displayed in
    // Trace Viewer when you view an event in the analysis section.
    "args": {
        "someArg": 1,
        "anotherArg": {
            "value": "my value"
        }
    }
}

/*
Event type          Event phases
Duration Events     B (begin), E (end)
Complete Events     X
Instant Events      i
Deprecated          I 
Counter Events      C
Async Events        b (nestable start), n (nestable instant), e (nestable end)
Deprecated          S (start), T (step into), p (step past), F (end)
Flow Events         s (start), t (step), f (end)
Sample Events       P
Object Events       N (created), O (snapshot), D (destroyed)
Metadata Events     M
Memory Dump Events  V (global), v (process)
Mark Events         R
Clock Sync Events   c
Context Events      (, )
*/