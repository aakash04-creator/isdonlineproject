using UnityEngine;
using TMPro;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Handles user interface, moves display, timer, pause overlay, and win dialogs.
    /// </summary>
    public class GameUI : MonoBehaviour
    {
        [Header("HUD Elements")]
        [SerializeField] private TMP_Text movesText;
        [SerializeField] private TMP_Text timerText;
        [SerializeField] private GameObject victoryPanel;
        [SerializeField] private GameObject pausePanel;

        private void Start()
        {
            if (LevelManager.Instance != null)
            {
                LevelManager.Instance.OnMovesChanged += UpdateMoves;
                LevelManager.Instance.OnLevelWon += ShowVictory;
            }

            if (victoryPanel != null) victoryPanel.SetActive(false);
            if (pausePanel != null) pausePanel.SetActive(false);
        }

        private void Update()
        {
            if (LevelManager.Instance != null && timerText != null && !LevelManager.Instance.IsLevelCompleted)
            {
                float t = LevelManager.Instance.ElapsedTime;
                int minutes = Mathf.FloorToInt(t / 60f);
                int seconds = Mathf.FloorToInt(t % 60f);
                timerText.text = $"{minutes:00}:{seconds:00}";
            }
        }

        private void UpdateMoves(int moves)
        {
            if (movesText != null)
            {
                movesText.text = $"Moves: {moves}";
            }
        }

        private void ShowVictory()
        {
            if (victoryPanel != null)
            {
                victoryPanel.SetActive(true);
            }
        }

        public void TogglePause()
        {
            if (pausePanel == null) return;
            bool isPaused = !pausePanel.activeSelf;
            pausePanel.SetActive(isPaused);
            Time.timeScale = isPaused ? 0f : 1f;
        }

        public void OnRestartClicked()
        {
            Time.timeScale = 1f;
            LevelManager.Instance?.RestartLevel();
        }

        public void OnNextLevelClicked()
        {
            Time.timeScale = 1f;
            LevelManager.Instance?.LoadNextLevel();
        }
    }
}
