window.requestAnimationFrame(function() {
    window.GM = new GameManager(30, 30, 100,
        {
            'table_id': 'game_grid',
            'start_button_id': 'game_start'
        }
    );
});