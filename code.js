document.addEventListener('DOMContentLoaded', function() {
    // Get all tabs and tab contents
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const explorerItems = document.querySelectorAll('.explorer-item');
    
    // Function to switch tabs
    function switchTab(fileId) {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`.tab[data-file="${fileId}"]`);
        const selectedContent = document.getElementById(`${fileId}-content`);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
        }
    }
    
    // Add click events to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const fileId = this.getAttribute('data-file');
            switchTab(fileId);
        });
    });
    
    // Add click events to explorer items
    explorerItems.forEach(item => {
        item.addEventListener('click', function() {
            const fileId = this.getAttribute('data-file');
            switchTab(fileId);
        });
    });
});
document.querySelectorAll('.code-content').forEach(content => {
    content.addEventListener('scroll', function() {
        const lineNumbers = this.parentElement.querySelector('.line-numbers');
        lineNumbers.scrollTop = this.scrollTop;
    });
});
