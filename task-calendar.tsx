import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [calendar, setCalendar] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDay, setStartDay] = useState('');
  const [isSequenceStarted, setIsSequenceStarted] = useState(false);
  
  const intervalSequence = [3, 5, 7];

  useEffect(() => {
    generateCalendar();
  }, [selectedMonth, tasks, startDay, isSequenceStarted]);

  const resetCalendar = () => {
    setTasks([]);
    setNewTask('');
    setStartDay('');
    setIsSequenceStarted(false);
    setSelectedMonth(new Date());
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const startSequence = () => {
    if (startDay && !isSequenceStarted) {
      setIsSequenceStarted(true);
    }
  };

  const generateCalendar = () => {
    if (tasks.length === 0) {
      setCalendar(generateEmptyCalendar());
      return;
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarDays = [];

    // Generate task schedule
    let taskSchedule = {};
    if (isSequenceStarted) {
      let currentDate = new Date(year, month, parseInt(startDay));
      let sequenceIndex = 0;
      let taskIndex = 0;
      let daysInCurrentInterval = 0;

      while (currentDate <= lastDay) {
        const interval = intervalSequence[sequenceIndex];
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Schedule task for current date
        taskSchedule[dateString] = {
          task: tasks[taskIndex],
          interval: interval,
          sequence: `${interval}-day sequence`
        };

        // Move to next task and date
        taskIndex = (taskIndex + 1) % tasks.length;
        daysInCurrentInterval++;

        // If we've completed all tasks in current interval
        if (taskIndex === 0) {
          // If we've used this interval enough times, move to next interval
          if (daysInCurrentInterval >= tasks.length) {
            sequenceIndex = (sequenceIndex + 1) % intervalSequence.length;
            daysInCurrentInterval = 0;
          }
        }

        // Add one day to get to next task date
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        currentDate = nextDate;

        // If we completed a full sequence, jump ahead by the interval
        if (taskIndex === 0 && daysInCurrentInterval === 0) {
          const jumpDays = interval - tasks.length;
          currentDate.setDate(currentDate.getDate() + jumpDays);
        }
      }
    }

    // Fill calendar grid
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      calendarDays.push({
        date: date,
        task: taskSchedule[dateString]?.task,
        interval: taskSchedule[dateString]?.interval,
        sequence: taskSchedule[dateString]?.sequence
      });
    }

    setCalendar(calendarDays);
  };

  const generateEmptyCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarDays = [];

    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push({
        date: new Date(year, month, day),
        task: null,
        interval: null
      });
    }

    return calendarDays;
  };

  const formatMonth = (date) => {
    const months = {
      0: 'يناير',
      1: 'فبراير',
      2: 'مارس',
      3: 'أبريل',
      4: 'مايو',
      5: 'يونيو',
      6: 'يوليو',
      7: 'أغسطس',
      8: 'سبتمبر',
      9: 'أكتوبر',
      10: 'نوفمبر',
      11: 'ديسمبر'
    };
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const changeMonth = (delta) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {formatMonth(selectedMonth)}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => changeMonth(-1)}>السابق</Button>
              <Button onClick={() => changeMonth(1)}>التالي</Button>
              <Button 
                variant="destructive" 
                onClick={resetCalendar}
                className="ml-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة تعيين
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Task Input */}
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="أدخل المهمة"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
              />
              <Button onClick={addTask}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة مهمة
              </Button>
            </div>

            {/* Start Day Selection */}
            {!isSequenceStarted && tasks.length > 0 && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  placeholder="أدخل يوم البداية (1-31)"
                  className="w-48"
                />
                <Button 
                  onClick={startSequence}
                  disabled={!startDay || startDay < 1 || startDay > 31}
                >
                  بدء التسلسل
                </Button>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2">
              <h3 className="font-bold">ترتيب المهام:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{`${index + 1}. ${task}`}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sequence Info */}
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-bold mb-2">نمط التسلسل:</h4>
              <div className="text-sm space-y-1">
                <p>1. تنفيذ المهام بالتتابع لمدة 3 أيام</p>
                <p>2. ثم تنفيذ المهام بالتتابع كل 5 أيام</p>
                <p>3. ثم تنفيذ المهام بالتتابع كل 7 أيام</p>
                <p>4. يتكرر النمط من البداية</p>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center font-semibold">
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                  <div key={day} className="p-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 min-h-24 border rounded ${
                      day?.date?.toDateString() === new Date().toDateString()
                        ? 'bg-blue-50 border-blue-300' 
                        : day ? 'border-gray-200' : ''
                    }`}
                  >
                    {day && (
                      <>
                        <div className="font-semibold mb-1">
                          {day.date.getDate()}
                        </div>
                        {day.task && (
                          <div className={`text-sm p-1 rounded shadow-sm ${
                            day.interval === 3 ? 'bg-green-50' :
                            day.interval === 5 ? 'bg-blue-50' :
                            'bg-purple-50'
                          }`}>
                            <div className="font-medium">{day.task}</div>
                            {day.interval && (
                              <div className="text-xs text-gray-500">
                                تسلسل {day.interval} أيام
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendar;
