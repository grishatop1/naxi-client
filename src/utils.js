export function respondToVisibility(element, callback) {
    var options = {
      root: document.documentElement,
    };
  
    var observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target)
        }
      })
    });
  
    observer.observe(element);
  }