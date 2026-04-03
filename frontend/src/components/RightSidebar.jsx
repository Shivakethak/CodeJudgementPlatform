import React from 'react';

const RightSidebar = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('default', { month: 'short' });
  const year = currentDate.getFullYear();

  // Fake remaining days calculation for demonstration
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const daysInCurrentMonth = getDaysInMonth(currentDate.getMonth() + 1, year);
  
  return (
    <div className="right-sidebar">
      
      {/* Calendar Widget */}
      <div className="widget-card calendar-widget">
        <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className="cal-month">{month} {year}</span>
          <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>Streak: <strong style={{color: 'var(--lc-accent)'}}>4 Days</strong></span>
        </div>
        <div className="calendar-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '10px' }}>
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--lc-text-secondary)' }}>{d}</div>
            ))}
            {/* Empty spaces for padding */}
            {Array.from({ length: new Date(year, currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const currentDay = i + 1;
              const isToday = currentDay === day;
              // Fake active days for streak
              const isActive = currentDay >= day - 3 && currentDay <= day;
              return (
                <div 
                  key={currentDay} 
                  title={`${month} ${currentDay}, ${year}`}
                  style={{ 
                    aspectRatio: '1/1', 
                    background: isToday ? 'var(--lc-accent)' : isActive ? 'rgba(255,161,22, 0.4)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: isToday ? '#000' : 'var(--lc-text-secondary)',
                    fontWeight: isToday ? 'bold' : 'normal'
                  }}>
                  {currentDay}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Premium / Challenge */}
      <div className="widget-card weekly-challenge-widget">
        <h3 className="widget-title">Weekly Premium</h3>
        <p className="widget-subtitle">Solve problems to earn tokens.</p>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{width: '60%'}}></div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px'}}>
          <span style={{color: 'var(--lc-accent)'}}>3 / 5 Done</span>
          <span style={{color: 'var(--lc-text-secondary)'}}>Expires in 2 days</span>
        </div>
      </div>

      {/* Trending Companies */}
      <div className="widget-card trending-companies">
        <h3 className="widget-title">Trending Companies</h3>
        <div className="companies-list">
          <div className="company-item">
            <span className="company-name">Google</span>
            <span className="company-count">124</span>
          </div>
          <div className="company-item">
            <span className="company-name">Amazon</span>
            <span className="company-count">89</span>
          </div>
          <div className="company-item">
            <span className="company-name">Meta</span>
            <span className="company-count">76</span>
          </div>
          <div className="company-item">
            <span className="company-name">Microsoft</span>
            <span className="company-count">54</span>
          </div>
          <div className="company-item">
            <span className="company-name">Apple</span>
            <span className="company-count">48</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RightSidebar;
